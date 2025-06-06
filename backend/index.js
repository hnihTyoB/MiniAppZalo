require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');

const app = express();

// Cấu hình CORS với các origin được phép
const allowedOrigins = [
  "https://h5.zdn.vn",
  "zbrowser://h5.zdn.vn",
  "http://localhost:5000", // Thêm localhost để test local
  "http://localhost:3000"  // Thêm nếu frontend chạy trên cổng 3000 (React default)
];
app.use(cors({
  origin: (origin, callback) => {
    console.log('Request Origin:', origin);
    const allowedOrigins = [
      "https://h5.zdn.vn",
      "zbrowser://h5.zdn.vn",
      "http://localhost:5000",
      "http://localhost:3000",
    ];
    if (!origin) return callback(null, true); // Cho phép request không có origin (như Postman)
    if (allowedOrigins.includes(origin)) {
      callback(null, origin); // Trả chính xác origin thay vì true
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', serviceRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});