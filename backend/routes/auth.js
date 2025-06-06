require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// API đăng ký
router.post('/register', async (req, res) => {
  try {
    const { full_name, phone_number, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!full_name || !phone_number || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone_number = ?',
      [email, phone_number]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email hoặc số điện thoại đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Thêm người dùng mới vào bảng users với vai trò mặc định là 'user'
    const [result] = await pool.query(
      'INSERT INTO users (full_name, phone_number, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, phone_number, email, hashedPassword, 'user']
    );

    res.status(201).json({ message: 'Đăng ký thành công', userId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
});

// API đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!phone_number || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ số điện thoại và mật khẩu' });
    }

    // Tìm người dùng theo số điện thoại
    const [users] = await pool.query('SELECT * FROM users WHERE phone_number = ?', [phone_number]);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Số điện thoại không tồn tại' });
    }

    const user = users[0];

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    // Tạo JWT token với thông tin userId và role
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Đăng nhập thành công', token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
});
// API đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
  try {
    const { phoneNumber, newPassword, otp } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!phoneNumber || !newPassword || !otp) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ số điện thoại, mật khẩu mới và OTP' });
    }

    // Tìm user theo phoneNumber
    const [users] = await pool.query('SELECT * FROM users WHERE phone_number = ?', [phoneNumber]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Số điện thoại không tồn tại' });
    }
    const user = users[0];

    // Kiểm tra OTP
    const [otpRecord] = await pool.query(
      'SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND type = "reset_password" AND expires_at > NOW()',
      [user.id, otp]
    );
    if (otpRecord.length === 0) {
      return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
    }

    // Mã hóa mật khẩu mới
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    // Xóa OTP sau khi sử dụng
    await pool.query('DELETE FROM otps WHERE user_id = ? AND otp_code = ?', [user.id, otp]);

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi đặt lại mật khẩu', error: error.message });
  }
});

module.exports = router;