
// Khai báo các biến form
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Thêm loading state khi gọi API
const setLoading = (isLoading) => {
  const buttons = document.querySelectorAll('button[type="submit"]');
  buttons.forEach(btn => {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading ? 
      '<span class="spinner"></span> Đang xử lý...' : 
      btn.dataset.originalText;
  });
};

// Gán original text cho các nút
document.querySelectorAll('button[type="submit"]').forEach(btn => {
  btn.dataset.originalText = btn.innerHTML;
});

// Cải tiến hàm xử lý lỗi
const handleError = (error, defaultMessage) => {
  console.error('Lỗi:', error);
  alert(error.message || defaultMessage);
  setLoading(false);
};

// Cập nhật hàm login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Phân quyền chuyển hướng
      if (data.user && data.user.role && data.user.role.toLowerCase() === 'admin') {
        window.location.href = 'admin.html';
      } else {
      window.location.href = 'app.html';
      }
    } else {
      console.error('Đăng nhập thất bại:', data);
      alert(data.message || 'Đăng nhập thất bại');
    }
  } catch (error) {
    handleError(error, 'Đã xảy ra lỗi khi đăng nhập');
  } finally {
    setLoading(false);
  }
});

// Cập nhật hàm register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const sdt = document.getElementById('register-sdt').value;
    const fullname = document.getElementById('regName').value;
    const gender = document.getElementById('regGender').value;

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    // Gửi dữ liệu đăng ký
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, fullname, gender, SDT: sdt, email: `${username}@placeholder.com` }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      
      // Dispatch a custom event to notify login.js
      const event = new CustomEvent('registrationSuccess');
      document.dispatchEvent(event);

    } else {
      alert(data.message || 'Đăng ký thất bại!');
    }
  } catch (error) {
    handleError(error, 'Đã xảy ra lỗi khi đăng ký');
  } finally {
    setLoading(false);
  }
});

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('forgot-input').value;
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();
      alert(data.message || 'Nếu email tồn tại, bạn sẽ nhận được một liên kết khôi phục.');
      
      if (response.ok) {
        // Chuyển về form đăng nhập sau khi gửi thành công
        window.location.hash = 'login';
        document.dispatchEvent(new Event('hashchange'));
      }

    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu quên mật khẩu:', error);
      alert('Không thể kết nối đến máy chủ.');
    }
  });
}