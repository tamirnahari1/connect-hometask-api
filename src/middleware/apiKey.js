// Basic API key auth via x-api-key header.
module.exports = function apiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ success: false, code: 401, message: 'Unauthorized' });
  }
  next();
};
