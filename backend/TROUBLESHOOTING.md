# Hướng dẫn khắc phục lỗi Database

## Lỗi "Too many keys specified; max 64 keys allowed"

### Nguyên nhân:
- MySQL có giới hạn tối đa 64 index cho mỗi bảng
- Sequelize tự động tạo index cho foreign keys và unique constraints
- Có quá nhiều association được định nghĩa

### Cách khắc phục:

#### 1. Tạo file .env
Tạo file `.env` trong thư mục `backend` với nội dung:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dating_app
DB_USER=root
DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-secret-key-here

# Session Secret
SESSION_SECRET=your-session-secret

# Client URL
CLIENT_URL=http://localhost:3000

# Google OAuth (nếu sử dụng)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 2. Xóa và tạo lại database
```bash
node clean-db.js
```

#### 3. Test kết nối (tùy chọn)
```bash
node test-connection.js
```

#### 4. Khởi động server
```bash
npm start
```

### Các thay đổi đã thực hiện:

1. **Tắt hoàn toàn auto-index**: Thêm `indexes: []` trong cấu hình Sequelize
2. **Tắt foreign key constraints**: Thêm `foreignKeyConstraint: false`
3. **Tắt associations**: Comment out tất cả associations trong models
4. **Sửa controllers**: Thay thế `include` bằng join thủ công
5. **Tạo script clean-db.js**: Xóa và tạo lại database hoàn toàn
6. **Sửa cấu hình sync**: Sử dụng `force: false` thay vì `alter: true`

### Controllers đã được sửa:

- **messageController.js**: 
  - `getMatchedUsers`: Thay `include` bằng join thủ công
  - `getUsersLikedYou`: Thay `include` bằng join thủ công

### Nếu vẫn gặp lỗi:

#### Kiểm tra MySQL:
```sql
-- Xem tất cả database
SHOW DATABASES;

-- Xem tất cả bảng trong database dating_app
USE dating_app;
SHOW TABLES;

-- Xem index của từng bảng
SHOW INDEX FROM users;
SHOW INDEX FROM matches;
SHOW INDEX FROM messages;
SHOW INDEX FROM user_photos;
```

#### Xóa index thủ công (nếu cần):
```sql
-- Xóa index không cần thiết
DROP INDEX index_name ON table_name;

-- Xóa tất cả index (trừ PRIMARY KEY)
-- Thực hiện từng bảng một
```

#### Tạo lại database hoàn toàn:
```bash
# Dừng server
# Chạy script xóa database
node clean-db.js

# Test kết nối
node test-connection.js

# Khởi động lại server
npm start
```

### Lưu ý:
- Sau khi tắt associations, bạn cần join thủ công trong queries
- Các unique constraints vẫn được tạo tự động
- Chỉ tạo index khi thực sự cần thiết cho performance
- Các controllers đã được cập nhật để sử dụng join thủ công

### Lỗi "User is not associated to Match":
- Đã được khắc phục bằng cách thay thế `include` bằng join thủ công
- Các function `getMatchedUsers` và `getUsersLikedYou` đã được sửa 