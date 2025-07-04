const sequelize = require('./config/db');

async function addLocationColumn() {
  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN location VARCHAR(255) NULL;');
    console.log('Đã thêm cột location vào bảng users!');
  } catch (error) {
    console.error('Lỗi chi tiết:', error);
    if (error.original && error.original.errno === 1060) {
      console.log('Cột location đã tồn tại!');
    } else {
      console.error('Lỗi khi thêm cột location:', error);
    }
  } finally {
    process.exit();
  }
}

addLocationColumn(); 