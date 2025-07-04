document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const messageElement = document.getElementById('message');

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            messageElement.textContent = 'Mật khẩu xác nhận không khớp.';
            messageElement.style.color = 'red';
            return;
        }

        // Lấy token và id từ URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const id = params.get('id');

        if (!token || !id) {
            messageElement.textContent = 'URL không hợp lệ hoặc đã hết hạn.';
            messageElement.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/auth/reset-password/${id}/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                messageElement.textContent = data.message + ' Bạn sẽ được chuyển về trang đăng nhập sau 3 giây.';
                messageElement.style.color = 'green';
                resetPasswordForm.querySelector('button').disabled = true;
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                messageElement.textContent = data.message || 'Có lỗi xảy ra.';
                messageElement.style.color = 'red';
            }
        } catch (error) {
            console.error('Lỗi khi reset mật khẩu:', error);
            messageElement.textContent = 'Không thể kết nối đến máy chủ.';
            messageElement.style.color = 'red';
        }
    });
}); 