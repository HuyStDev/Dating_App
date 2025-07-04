# Dating App Frontend

## �� Cấu trúc thư mục

### Frontend
```
frontend/
├── public/
│   ├── index.html         # Trang chủ landing page
│   ├── login.html         # Trang đăng nhập/đăng ký
│   ├── app.html           # Trang chính cho user (sau đăng nhập)
│   ├── admin.html         # Trang quản trị admin (quản lý sự kiện, người dùng)
│   └── assets/
│       ├── css/           # Toàn bộ file CSS (base, discover, events, admin, ...)
│       ├── js/            # Toàn bộ file JS (main, discover, events, admin-events, ...)
│       └── images/        # Ảnh tĩnh, avatar mặc định, ...
└── README.md
```

### Backend
```
backend/
├── app.js                 # File khởi động server chính
├── package.json           # Thông tin package, scripts, dependencies
├── config/                # Cấu hình DB, biến môi trường
├── controllers/           # Xử lý logic cho API (user, event, ...)
├── models/                # Định nghĩa Sequelize models (User, Event, ...)
├── routes/                # Định nghĩa các route API
├── middlewares/           # Middleware xác thực, xử lý lỗi, ...
├── utils/                 # Tiện ích chung (gửi mail, mã hóa, ...)
├── uploads/               # Thư mục lưu file upload (ảnh, ...)
├── migrations/            # (Nếu có) Migration cho DB
└── ...
```

## 🚀 Tính năng chính

### 1. Trang người dùng (`app.html`)
- **Tìm bạn**: Swipe, bộ lọc, xem hồ sơ, like/dislike, match.
- **Tin nhắn**: Chat realtime, xem danh sách match, like, đã ẩn.
- **Hồ sơ cá nhân**: Xem/sửa thông tin, ảnh đại diện, sở thích, mạng xã hội.
- **Sự kiện**: Xem danh sách sự kiện, đăng ký tham gia, xem chi tiết sự kiện.
- **Sidebar sự kiện nổi bật** (desktop): Quảng cáo sự kiện đang diễn ra.
- **Responsive**: Tối ưu cho desktop, tablet, mobile (có bottom-nav trên mobile).

### 2. Trang quản trị admin (`admin.html`)
- **Quản lý sự kiện**: Thêm/sửa/xóa sự kiện, xem danh sách đăng ký.
- **Quản lý người dùng**: Xem danh sách user, xem chi tiết hồ sơ user.
- **Đăng xuất**: Đăng xuất admin.
- **Giao diện sidebar, header rõ ràng, hiện đại.**

## 🛠️ Công nghệ sử dụng
- **HTML5, CSS3** (Flexbox, Grid, Responsive, Animation)
- **JavaScript (ES6+)**: DOM, Fetch API, Event delegation
- **Node.js, Express.js** (backend)
- **Sequelize (ORM cho MySQL/PostgreSQL)**
- **Chart.js** (tùy chọn, nếu dùng biểu đồ)
- **FontAwesome**: Icon

## 📱 Responsive Design
- **Desktop**: Sidebar, layout 2 cột, sidebar sự kiện nổi bật.
- **Tablet/Mobile**: Ẩn sidebar, dùng bottom-nav, tối ưu trải nghiệm chạm.

## 🔗 Navigation
- **index.html**: Trang chủ landing
- **login.html**: Đăng nhập/Đăng ký
- **app.html**: Trang chính user (sau đăng nhập)
- **admin.html**: Trang quản trị admin

## 🚀 Hướng dẫn chạy dự án (Backend + Frontend)

### 1. **Clone và cài đặt**
```bash
# Clone project
# cd vào thư mục dự án

# Cài đặt backend
cd dating-app/backend
npm install

# Cài đặt frontend (nếu có package riêng)
cd ../frontend
# (Thông thường chỉ cần live-server, không cần npm install)
```

### 2. **Khởi động Backend**
```bash
cd dating-app/backend
node app.js
# hoặc dùng: npm start
# Backend mặc định chạy ở http://localhost:5000
```

### 3. **Khởi động Frontend**
```bash
cd dating-app/frontend/public
live-server --port=3000
# hoặc dùng extension Live Server của VS Code
# Frontend chạy ở http://localhost:3000
```

### 4. **Truy cập các trang**
- Trang chủ: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- Trang user: [http://localhost:3000/app.html](http://localhost:3000/app.html)
- Trang admin: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### 5. **Lưu ý khi chạy dự án**
- **Backend phải chạy trước để frontend fetch API thành công.**
- **Port backend (5000) và frontend (3000) phải đúng như cấu hình.**
- **Nếu dùng CORS, đảm bảo backend cho phép truy cập từ frontend.**
- **Token đăng nhập lưu ở localStorage.**
- **Chỉ admin mới truy cập được admin.html (nên kiểm tra token/role ở backend).**
- **Ảnh upload: Đường dẫn ảnh sự kiện, avatar cần đúng domain backend nếu là file upload.**
- **Sidebar sự kiện nổi bật chỉ hiển thị ở desktop.**

## 🎯 Mục tiêu dự án
- Kết nối, tìm bạn, chat, tham gia sự kiện, quản trị dễ dàng.
- Giao diện hiện đại, thân thiện, tối ưu mọi thiết bị.
- Dễ mở rộng, bảo trì, tích hợp thêm tính năng mới. 