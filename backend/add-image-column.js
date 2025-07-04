const sequelize = require("./config/db");
const { QueryTypes } = require("sequelize");

async function addImageColumns() {
  try {
    // Thêm cột image_url
    await sequelize.query(
      `
      ALTER TABLE messages 
      ADD COLUMN image_url VARCHAR(255) NULL
    `,
      { type: QueryTypes.RAW }
    );
    console.log("✅ Đã thêm cột image_url");

    // Thêm cột message_type
    await sequelize.query(
      `
      ALTER TABLE messages 
      ADD COLUMN message_type ENUM('text', 'image', 'image_with_text') NOT NULL DEFAULT 'text'
    `,
      { type: QueryTypes.RAW }
    );
    console.log("✅ Đã thêm cột message_type");

    console.log("🎉 Cập nhật database thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật database:", error.message);
  } finally {
    await sequelize.close();
  }
}

addImageColumns();
