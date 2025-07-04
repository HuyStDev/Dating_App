const sequelize = require('./config/db');

async function resetDatabase() {
  try {
    console.log('🔄 Đang reset database...');
    
    // Xóa tất cả bảng
    await sequelize.drop();
    console.log('✅ Đã xóa tất cả bảng');
    
    // Tạo lại tất cả bảng
    await sequelize.sync({ force: true });
    console.log('✅ Đã tạo lại tất cả bảng');
    
    console.log('🎉 Reset database thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi reset database:', error.message);
    process.exit(1);
  }
}

resetDatabase(); 