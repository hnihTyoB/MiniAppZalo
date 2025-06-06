require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('JWT_SECRET in middleware/auth.js:', process.env.JWT_SECRET); // Log để kiểm tra

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.get('Authorization');
  console.log('Received request for:', req.path, 'with Authorization:', authHeader);
  if (!authHeader) {
    console.log('No Authorization header');
    return res.status(401).json({ message: 'Không tìm thấy header Authorization' });
  }
  if (!authHeader.startsWith('Bearer ')) {
    console.log('Invalid Authorization format');
    return res.status(401).json({ message: 'Header Authorization không đúng định dạng' });
  }
  const token = authHeader.substring(7);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Token không hợp lệ' });
    }
    req.user = decoded;
    console.log('Token verified, user:', decoded);
    next();
  });
};

// Middleware kiểm tra vai trò admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập API này' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };