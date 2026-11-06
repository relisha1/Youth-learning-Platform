// Small QR code maker (byte mode, error correction level M, versions 1 to 10).
// makeQr("some text") gives back { size, modules } where modules[y][x] is true for a dark square.

// error correction codewords per block and number of blocks, level M, index = version
const ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const NUM_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];

const getBit = (value, index) => ((value >>> index) & 1) !== 0;

// number of squares in the picture that can hold data (before error correction is taken out)
const rawModules = (version) => {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
};

const dataCodewordsFor = (version) => {
  return Math.floor(rawModules(version) / 8) - ECC_PER_BLOCK[version] * NUM_BLOCKS[version];
};

// multiplication in the number system the error correction uses
const multiply = (x, y) => {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
};

const makeDivisor = (degree) => {
  const result = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = multiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = multiply(root, 2);
  }
  return result;
};

const makeRemainder = (data, divisor) => {
  const result = divisor.map(() => 0);
  data.forEach(b => {
    const factor = b ^ result.shift();
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= multiply(coef, factor);
    });
  });
  return result;
};

// turns the text into the bytes of the QR code, with the error correction added
const makeCodewords = (bytes, version) => {
  const bits = [];
  const addBits = (value, count) => {
    for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };

  addBits(0x4, 4); // byte mode
  addBits(bytes.length, version >= 10 ? 16 : 8);
  bytes.forEach(b => addBits(b, 8));

  const capacityBits = dataCodewordsFor(version) * 8;
  addBits(0, Math.min(4, capacityBits - bits.length));
  addBits(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) addBits(pad, 8);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }

  // cut into blocks, add error correction to each block, then mix the blocks together
  const numBlocks = NUM_BLOCKS[version];
  const eccLen = ECC_PER_BLOCK[version];
  const rawCodewords = Math.floor(rawModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks = [];
  const divisor = makeDivisor(eccLen);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortBlockLen - eccLen + (i < numShortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = makeRemainder(dat, divisor);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  const result = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - eccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
};

const alignPositions = (version, size) => {
  if (version === 1) return [];
  const numAlign = Math.floor(version / 7) + 2;
  const step = Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
};

const penaltyScore = (modules, size) => {
  let score = 0;

  // long lines of the same colour
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < size; a++) {
      let run = 1;
      for (let b = 1; b < size; b++) {
        const same = pass === 0 ? modules[a][b] === modules[a][b - 1] : modules[b][a] === modules[b - 1][a];
        if (same) {
          run++;
          if (run === 5) score += 3;
          else if (run > 5) score += 1;
        } else {
          run = 1;
        }
      }
    }
  }

  // 2 by 2 blocks of the same colour
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = modules[y][x];
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) score += 3;
    }
  }

  // too many dark or too many light squares
  let dark = 0;
  modules.forEach(row => row.forEach(m => { if (m) dark++; }));
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
};

export const makeQr = (text) => {
  const bytes = Array.from(new TextEncoder().encode(text));

  // the smallest version that fits the text
  let version = 1;
  while (version <= 10) {
    const needed = 4 + (version >= 10 ? 16 : 8) + bytes.length * 8;
    if (needed <= dataCodewordsFor(version) * 8) break;
    version++;
  }
  if (version > 10) throw new Error('Text is too long for the QR code');

  const size = version * 4 + 17;
  const modules = [];
  const isFunction = [];
  for (let y = 0; y < size; y++) {
    modules.push(new Array(size).fill(false));
    isFunction.push(new Array(size).fill(false));
  }

  const setFunction = (x, y, dark) => {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  // lines of alternating squares
  for (let i = 0; i < size; i++) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }

  // three big squares in the corners
  const drawFinder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) setFunction(x, y, dist !== 2 && dist !== 4);
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // small squares that help the camera
  const positions = alignPositions(version, size);
  positions.forEach((px, i) => {
    positions.forEach((py, j) => {
      const inCorner = (i === 0 && j === 0) || (i === 0 && j === positions.length - 1) || (i === positions.length - 1 && j === 0);
      if (inCorner) return;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          setFunction(px + dx, py + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    });
  });

  // version number (only from version 7)
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = getBit(bits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunction(a, b, dark);
      setFunction(b, a, dark);
    }
  }

  // format information: tells the reader the error correction level (M) and the mask
  const drawFormat = (mask) => {
    const data = (0 << 3) | mask; // level M is 0
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) setFunction(8, i, getBit(bits, i));
    setFunction(8, 7, getBit(bits, 6));
    setFunction(8, 8, getBit(bits, 7));
    setFunction(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) setFunction(14 - i, 8, getBit(bits, i));

    for (let i = 0; i < 8; i++) setFunction(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) setFunction(8, size - 15 + i, getBit(bits, i));
    setFunction(8, size - 8, true);
  };
  drawFormat(0);

  // put the data in, going up and down in columns of two
  const codewords = makeCodewords(bytes, version);
  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < codewords.length * 8) {
          modules[y][x] = getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7));
          bitIndex++;
        }
      }
    }
  }

  const applyMask = (mask) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let flip;
        switch (mask) {
          case 0: flip = (x + y) % 2 === 0; break;
          case 1: flip = y % 2 === 0; break;
          case 2: flip = x % 3 === 0; break;
          case 3: flip = (x + y) % 3 === 0; break;
          case 4: flip = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: flip = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: flip = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: flip = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        if (flip && !isFunction[y][x]) modules[y][x] = !modules[y][x];
      }
    }
  };

  // try all 8 masks and keep the best one
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask);
    drawFormat(mask);
    const score = penaltyScore(modules, size);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }
    applyMask(mask); // undo
  }
  applyMask(bestMask);
  drawFormat(bestMask);

  return { size, modules };
};
