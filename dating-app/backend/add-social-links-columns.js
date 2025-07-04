const { Sequelize } = require('sequelize');
const sequelize = require('./config/db');

async function addSocialLinksColumns() {
  await sequelize.query(`ALTER TABLE users ADD COLUMN facebook VARCHAR(255);`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN instagram VARCHAR(255);`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN tiktok VARCHAR(255);`);
  await sequelize.query(`ALTER TABLE users ADD COLUMN zalo VARCHAR(255);`);
  console.log('Đã thêm các trường mạng xã hội vào bảng users!');
  process.exit(0);
}

addSocialLinksColumns().catch(err => {
  console.error('Lỗi khi thêm cột:', err);
  process.exit(1);
}); 