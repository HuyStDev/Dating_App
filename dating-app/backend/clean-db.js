const { Sequelize } = require("sequelize");
require("dotenv").config();

// Kết nối trực tiếp đến MySQL server (không phải database cụ thể)
const sequelize = new Sequelize(
  "mysql", // Kết nối đến database mysql
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "nhathuy19062005",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

async function cleanDatabase() {
  try {
    console.log("🔄 Đang kết nối đến MySQL server...");
    await sequelize.authenticate();
    console.log("✅ Kết nối thành công");

    const dbName = process.env.DB_NAME || "dating_app";

    console.log(`🗑️ Đang xóa database ${dbName}...`);
    await sequelize.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log("✅ Đã xóa database cũ");

    console.log(`🆕 Đang tạo database ${dbName}...`);
    await sequelize.query(`CREATE DATABASE ${dbName}`);
    console.log("✅ Đã tạo database mới");

    console.log("🎉 Hoàn thành! Bây giờ bạn có thể chạy lại server.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

cleanDatabase();
