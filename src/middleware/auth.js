require('dotenv').config();
const API_TOKEN = process.env.API_TOKEN;

function authMiddleware(req, res, next) {
  if (req.path === '/health') return next();

  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  if (!API_TOKEN || token !== API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function wsAuth(token) {
  return API_TOKEN && token === API_TOKEN;
}

module.exports = { authMiddleware, wsAuth };
