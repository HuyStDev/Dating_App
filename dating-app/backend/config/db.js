// Kết nối MySQL bằng Sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dating_app',       // Tên database
  process.env.DB_USER || 'root',       // Tên user MySQL
  process.env.DB_PASSWORD || 'nhathuy19062005',   // Mật khẩu MySQL
  {
    host: process.env.DB_HOST || 'localhost',  // Địa chỉ host
    port: process.env.DB_PORT || 3306, // Thêm port (mặc định 3306)
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000 // Tăng timeout kết nối
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false, // Tắt log SQL (bật khi cần debug)
    define: {
      // Tắt tự động tạo timestamps nếu không cần
      //timestamps: false,
      // Tắt tự động tạo foreign key constraints
      freezeTableName: true,
      // Tắt tự động tạo index
      indexes: []
    }
  }
);

// Kiểm tra kết nối
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.log('ℹ️ Kiểm tra lại:');
    console.log('- MySQL đã chạy chưa?');
    console.log('- Thông tin trong file .env có đúng không?');
    console.log('- Đã tạo database chưa? (CREATE DATABASE dating_app)');
  }
})();

module.exports = sequelize;
