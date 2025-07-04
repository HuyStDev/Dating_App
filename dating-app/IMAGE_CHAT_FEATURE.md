# Tính năng Gửi Ảnh trong Chat

## Tổng quan

Tính năng gửi ảnh trong chat cho phép người dùng gửi ảnh cho nhau trong cuộc trò chuyện. Hỗ trợ gửi ảnh đơn thuần hoặc ảnh kèm text.

## Tính năng

### 1. Gửi ảnh

- Nhấn nút 📷 (icon ảnh) trong chat input
- Chọn file ảnh từ máy tính
- Hỗ trợ định dạng: JPEG, JPG, PNG, GIF
- Giới hạn kích thước: 5MB

### 2. Gửi ảnh kèm text

- Nhập text trước khi chọn ảnh
- Ảnh và text sẽ được gửi cùng lúc
- Text sẽ hiển thị dưới ảnh

### 3. Xem ảnh

- Click vào ảnh để xem toàn màn hình
- Modal hiển thị ảnh với nút đóng
- Đóng modal bằng nút X hoặc phím ESC

### 4. Hiển thị trong danh sách chat

- Tin nhắn ảnh hiển thị: "📷 Ảnh"
- Tin nhắn ảnh + text hiển thị: "📷 [nội dung text]"

## Cấu trúc Database

### Bảng `messages`

- `image_url`: Đường dẫn đến file ảnh (nullable)
- `message_type`: Loại tin nhắn ('text', 'image', 'image_with_text')

## API Endpoints

### POST `/api/messages`

Gửi tin nhắn (text hoặc ảnh)

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `receiver_id`: ID người nhận
  - `content`: Nội dung text (optional)
  - `image`: File ảnh (optional)

**Response:**

```json
{
  "message": "Gửi thành công",
  "data": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "content": "Hello",
    "image_url": "/uploads/messages/msg-1234567890.jpg",
    "message_type": "image_with_text",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Cấu trúc File

### Backend

```
backend/
├── controllers/
│   └── messageController.js    # Xử lý gửi tin nhắn và ảnh
├── models/
│   └── Message.js             # Model với trường image_url và message_type
├── routes/
│   └── messageRoutes.js       # Route với middleware upload
├── uploads/
│   └── messages/              # Thư mục lưu ảnh tin nhắn
└── add-image-column.js        # Script cập nhật database
```

### Frontend

```
frontend/public/
├── app.html                   # HTML với nút gửi ảnh và modal
├── assets/
│   ├── css/
│   │   └── messages.css       # CSS cho ảnh và modal
│   └── js/
│       └── messages.js        # JavaScript xử lý gửi ảnh
```

## Cài đặt

### 1. Cập nhật Database

```bash
cd backend
node add-image-column.js
```

### 2. Cài đặt Dependencies

```bash
cd backend
npm install multer
```

### 3. Khởi động Server

```bash
cd backend
npm start
```

## Sử dụng

1. **Gửi ảnh đơn thuần:**

   - Click nút 📷 trong chat
   - Chọn file ảnh
   - Ảnh sẽ được gửi ngay lập tức

2. **Gửi ảnh kèm text:**

   - Nhập text vào ô chat
   - Click nút 📷
   - Chọn file ảnh
   - Ảnh và text sẽ được gửi cùng lúc

3. **Xem ảnh toàn màn hình:**
   - Click vào ảnh trong chat
   - Modal sẽ hiển thị ảnh toàn màn hình
   - Click nút X hoặc nhấn ESC để đóng

## Lưu ý

- Ảnh được lưu trong thư mục `backend/uploads/messages/`
- Tên file được tạo tự động với prefix "msg-"
- Hỗ trợ tối đa 5MB cho mỗi file ảnh
- Chỉ chấp nhận định dạng ảnh: JPEG, JPG, PNG, GIF
- Ảnh được hiển thị với kích thước tối đa 200x200px trong chat
- Có thể click để xem ảnh toàn màn hình
