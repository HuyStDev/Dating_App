require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const messageRoutes = require('./routes/messageRoutes');
const User = require('./models/User');
const { authenticate } = require('./utils/authUtils');
const multer = require('multer');
const db = require('./models');

// Passport Config
require('./config/passport-setup');

const app = express();

// Thêm middleware parse JSON và urlencoded cho toàn bộ API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://dating-app-frontend-tcf1.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501'
].filter(Boolean); // Lọc ra các giá trị undefined/null

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép các yêu cầu không có origin (như Postman, mobile apps) hoặc từ các origin trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint (đặt trước các routes khác)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Test the database connection
sequelize.authenticate()
    .then(() => {
      console.log('✅ Kết nối database thành công');
      // Sync all models với force: false để tránh xóa dữ liệu
      return sequelize.sync({ force: false });
    })
    .then(() => console.log('✅ Đồng bộ model thành công'))
    .catch(err => {
      console.error('❌ Lỗi kết nối database:', err.message);
      console.log('ℹ️ Hướng dẫn khắc phục:');
      console.log('1. Đảm bảo MySQL đang chạy');
      console.log('2. Tạo database: CREATE DATABASE dating_app;');
      console.log('3. Kiểm tra thông tin kết nối trong file .env');
      console.log('4. Nếu vẫn lỗi, thử xóa và tạo lại database');
    });

// Routes
app.use('/api/auth', express.json(), express.urlencoded({ extended: true }), authRoutes);
app.use('/api', apiRoutes);
app.use('/api/messages', messageRoutes);

// Seed admin user nếu chưa có
(async () => {
  try {
    const [admin, created] = await db.User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: '$2b$10$LnVI/yncXT1NlwZ7Vf5saOUGgyl6D/vnDcyIb8roVUt.Rdbv6FLRC', // Đổi mật khẩu admin tại đây, nên hash khi dùng thực tế!
        name: 'Admin',
        role: 'admin'
      }
    });
    if (created) {
      console.log('Đã tạo tài khoản admin mặc định!');
    } else {
      console.log('Tài khoản admin đã tồn tại.');
    }
  } catch (err) {
    console.error('Lỗi khi seed admin:', err);
  }
})();

// Xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Không tìm thấy tài nguyên' 
  });
});

// Xử lý lỗi server (phải đặt cuối cùng)
app.use((err, req, res, next) => {
  // Xử lý lỗi từ Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File quá lớn. Vui lòng chọn file có dung lượng nhỏ hơn.' });
    }
    return res.status(400).json({ message: err.message });
  }

  // Xử lý lỗi validation từ Sequelize
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ message: `Lỗi dữ liệu: ${messages.join(', ')}` });
  }
  
  // Các lỗi server khác
    console.error('🔥 Lỗi server:', err.stack);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Lỗi server nội bộ',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server đang chạy trên port ${PORT}`);
  console.log(`🔗 Truy cập: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`⚡ Health check: http://localhost:${PORT}/api/health\n`);
});

db.sequelize.sync({ alter: true });