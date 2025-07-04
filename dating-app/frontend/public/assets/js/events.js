document.addEventListener('DOMContentLoaded', function() {
  const API_URL = 'https://dating-app-pzb4.onrender.com/api/events';
  const section = document.getElementById('eventSection');
  const modal = document.getElementById('eventRegisterModal');
  const closeModal = modal ? modal.querySelector('.close') : null;
  const form = document.getElementById('eventRegisterForm');
  let currentEventId = null;

  // Lấy token nếu user đã đăng nhập
  const token = localStorage.getItem('token');

  // Fetch danh sách sự kiện
  function fetchEvents() {
    fetch(API_URL)
      .then(res => res.json())
      .then(events => renderEvents(events))
      .catch((err) => {
        console.error('Lỗi fetch sự kiện:', err);
        section.innerHTML = '<p>Không thể tải danh sách sự kiện!</p>';
      });
  }

  // Render danh sách sự kiện với giao diện đẹp
  function renderEvents(events) {
    if (!events.length) {
      section.innerHTML = '<p>Chưa có sự kiện nào.</p>';
      return;
    }
    const backendUrl = "http://localhost:5000";
    section.innerHTML = `
      <div class="event-list">
        ${events.map(event => {
          let imageSrc = event.image
            ? (event.image.startsWith('/uploads') ? backendUrl + event.image : event.image)
            : 'assets/images/default-avatar.jpg';
          return `
          <div class="event-card">
            <div class="event-card-img">
              <img src="${imageSrc}" alt="${event.title}" />
            </div>
            <div class="event-card-body">
              <h3 class="event-title">${event.title}</h3>
              <div class="event-time"><i class="fas fa-calendar-alt"></i> ${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}</div>
              <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location || ''}</div>
              <div class="event-desc">${event.description || ''}</div>
              <button class="register-btn" data-id="${event.id}">Đăng ký</button>
              <button class="detail-btn" data-id="${event.id}">Xem chi tiết</button>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Xử lý click nút đăng ký
  section.onclick = function(e) {
    if (e.target.classList.contains('register-btn')) {
      currentEventId = e.target.dataset.id;
      form.reset();
      modal.style.display = 'block';
    }
    // Xử lý nút xem chi tiết
    if (e.target.classList.contains('detail-btn')) {
      const card = e.target.closest('.event-card');
      const title = card.querySelector('.event-title').innerText;
      const time = card.querySelector('.event-time').innerText;
      const location = card.querySelector('.event-location').innerText;
      const desc = card.querySelector('.event-desc').innerText;
      const imgSrc = card.querySelector('.event-card-img img').src;
      const detailModal = document.getElementById('eventDetailModal');
      const detailContent = document.getElementById('eventDetailContent');
      detailContent.innerHTML = `
        <img src="${imgSrc}" style="width:100%;border-radius:12px;max-height:320px;object-fit:cover;">
        <h2 style="color:#e91e63;margin:16px 0 8px 0;">${title}</h2>
        <div style="color:#666;margin-bottom:6px;">${time}</div>
        <div style="color:#888;margin-bottom:10px;"><i class='fas fa-map-marker-alt'></i> ${location}</div>
        <div class="event-detail-desc" style="font-size:1.05rem;">${desc}</div>
      `;
      detailModal.style.display = 'flex';
    }
  };
  if (closeModal) closeModal.onclick = function() { modal.style.display = 'none'; };
  window.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };

  // Submit form đăng ký
  form.onsubmit = function(e) {
    e.preventDefault();
    const data = {
      name: form.querySelector('[name="name"]').value,
      email: form.querySelector('[name="email"]').value,
      phone: form.querySelector('[name="phone"]').value,
      other_info: form.querySelector('[name="other_info"]').value
    };
    fetch(`${API_URL}/${currentEventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          alert('Lỗi: ' + (res.message || 'Đăng ký thất bại!') + '\n' + JSON.stringify(res.error));
        } else {
          alert(res.message || 'Đăng ký thành công!');
          modal.style.display = 'none';
        }
      })
      .catch(err => alert('Lỗi kết nối: ' + err));
  };

  // Đóng modal chi tiết
  const detailModal = document.getElementById('eventDetailModal');
  if (detailModal) {
    detailModal.querySelector('.close').onclick = function() {
      detailModal.style.display = 'none';
    };
    window.addEventListener('click', function(e) {
      if (e.target === detailModal) detailModal.style.display = 'none';
    });
  }

  fetchEvents();
}); 