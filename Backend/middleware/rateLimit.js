// Slows down people who try too many times (for example guessing passwords).
// It remembers the tries of each address in memory, so it starts fresh when the server restarts.
function rateLimit(maxTries, minutes) {
  const tries = new Map();

  // remove old entries every few minutes
  setInterval(() => {
    const now = Date.now();
    tries.forEach((item, key) => {
      if (item.resetAt < now) tries.delete(key);
    });
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const now = Date.now();
    let item = tries.get(req.ip);

    if (!item || item.resetAt < now) {
      item = { count: 0, resetAt: now + minutes * 60 * 1000 };
      tries.set(req.ip, item);
    }

    item.count++;
    if (item.count > maxTries) {
      return res.status(429).json({
        success: false,
        message: 'Too many tries. Please wait a few minutes and try again.'
      });
    }
    next();
  };
}

module.exports = rateLimit;
