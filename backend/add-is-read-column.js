const sequelize = require('./config/db');

async function addIsReadColumn() {
  try {
    // Thêm cột is_read vào bảng messages
    await sequelize.query(`
      ALTER TABLE messages 
      ADD COLUMN is_read BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ Đã thêm cột is_read vào bảng messages thành công!');
    
    // Cập nhật tất cả tin nhắn cũ thành đã đọc
    await sequelize.query(`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE is_read IS NULL OR is_read = FALSE
    `);
    
    console.log('✅ Đã cập nhật tất cả tin nhắn cũ thành đã đọc!');
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm cột is_read:', error.message);
  } finally {
    await sequelize.close();
  }
}

addIsReadColumn(); 