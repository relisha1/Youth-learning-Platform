import { makeQr } from '../utils/qr';

// draws a QR code as a small picture (svg)
const QrCode = ({ text, size = 160 }) => {
  let qr;
  try {
    qr = makeQr(text);
  } catch (error) {
    return <p>QR code could not be made.</p>;
  }

  const border = 4;
  const total = qr.size + border * 2;

  // one black square for every dark module
  const squares = [];
  qr.modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) {
        squares.push(<rect key={x + '-' + y} x={x + border} y={y + border} width="1" height="1" />);
      }
    });
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code that opens the certificate check page"
    >
      <rect width={total} height={total} fill="white" />
      <g fill="black">{squares}</g>
    </svg>
  );
};

export default QrCode;
