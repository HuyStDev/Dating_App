const fs = require("fs");
const path = require("path");

// Test tạo thư mục uploads/messages
const uploadsDir = path.join(__dirname, "uploads");
const messagesDir = path.join(uploadsDir, "messages");

console.log("🔍 Kiểm tra thư mục uploads...");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Đã tạo thư mục uploads");
} else {
  console.log("✅ Thư mục uploads đã tồn tại");
}

if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir, { recursive: true });
  console.log("✅ Đã tạo thư mục uploads/messages");
} else {
  console.log("✅ Thư mục uploads/messages đã tồn tại");
}

console.log("\n📁 Cấu trúc thư mục:");
console.log(`   ${uploadsDir}`);
console.log(`   └── messages/`);

console.log("\n🎉 Kiểm tra hoàn tất!");
console.log("💡 Bây giờ bạn có thể khởi động server và test tính năng gửi ảnh");
