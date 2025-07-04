const sequelize = require("./config/db");
const { User, Match, Message, UserPhoto } = require("./models");

async function testConnection() {
  try {
    console.log("🔄 Đang test kết nối database...");

    // Test kết nối
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công");

    // Test sync models
    console.log("🔄 Đang sync models...");
    await sequelize.sync({ force: false });
    console.log("✅ Sync models thành công");

    // Test tạo user
    console.log("🔄 Đang test tạo user...");
    const testUser = await User.create({
      username: "test_user",
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      age: 25,
      gender: "male",
    });
    console.log("✅ Tạo user thành công:", testUser.id);

    // Tạo user thứ hai
    const testUser2 = await User.create({
      username: "test_user2",
      name: "Test User 2",
      email: "test2@example.com",
      password: "password123",
      age: 26,
      gender: "female",
    });
    console.log("✅ Tạo user 2 thành công:", testUser2.id);

    // Test tạo match
    console.log("🔄 Đang test tạo match...");
    const testMatch = await Match.create({
      user1_id: testUser.id,
      user2_id: testUser2.id, // Sử dụng ID hợp lệ
      status: "pending",
    });
    console.log("✅ Tạo match thành công:", testMatch.id);

    // Test query với join thủ công
    console.log("🔄 Đang test query join thủ công...");
    const matches = await Match.findAll({
      where: { user1_id: testUser.id },
    });
    console.log("✅ Query matches thành công:", matches.length, "records");

    // Cleanup
    console.log("🔄 Đang cleanup...");
    await Match.destroy({ where: { id: testMatch.id } });
    await User.destroy({ where: { id: testUser.id } });
    await User.destroy({ where: { id: testUser2.id } });
    console.log("✅ Cleanup thành công");

    console.log("🎉 Tất cả test đều thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi test:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

testConnection();
