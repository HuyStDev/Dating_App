document.addEventListener('DOMContentLoaded', function() {
  const API_URL = 'http://localhost:5000/api/events';
  const tableBody = document.querySelector('#eventsTable tbody');
  const btnAddEvent = document.getElementById('btnAddEvent');
  const modal = document.getElementById('eventFormModal');
  const closeModal = modal.querySelector('.close');
  const form = document.getElementById('eventForm');
  const formTitle = document.getElementById('formTitle');

  let editingEventId = null;

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Bạn chưa đăng nhập!');
    window.location.href = '/login.html';
    return;
  }

  // Fetch danh sách sự kiện
  function fetchEvents() {
    fetch(API_URL, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => renderEvents(data))
      .catch(() => alert('Không thể tải danh sách sự kiện!'));
  }

  // Render bảng sự kiện
  function renderEvents(events) {
    tableBody.innerHTML = '';
    events.forEach((event, idx) => {
      const tr = document.createElement('tr');
      let desc = (event.description || '').split('\n')[0];
      if (desc.length > 60) desc = desc.slice(0, 60) + '...';
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${event.title}</td>
        <td>${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}</td>
        <td>${event.location || ''}</td>
        <td><span class="event-desc-admin" title="${(event.description || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${desc}</span></td>
        <td>
          <button class="edit" data-id="${event.id}">Sửa</button>
          <button class="delete" data-id="${event.id}">Xóa</button>
          <button class="registrations" data-id="${event.id}">Xem đăng ký</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Hiện modal form
  btnAddEvent.onclick = function() {
    editingEventId = null;
    formTitle.textContent = 'Thêm sự kiện';
    form.reset();
    if (imagePreview) imagePreview.innerHTML = '';
    modal.style.display = 'block';
  };
  closeModal.onclick = function() { modal.style.display = 'none'; };
  window.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };

  // Xử lý upload/preview ảnh và ghép ngày-giờ khi submit form sự kiện
  const imageInput = document.getElementById('image');
  const imageDropArea = document.getElementById('imageDropArea');
  const imageDropText = document.getElementById('imageDropText');
  const imagePreview = document.getElementById('imagePreview');
  // Submit form thêm/sửa
  form.onsubmit = function(e) {
    e.preventDefault();
    // Ghép ngày + giờ thành ISO
    const startDate = document.getElementById('start_date').value;
    const startTime = document.getElementById('start_time').value;
    const endDate = document.getElementById('end_date').value;
    const endTime = document.getElementById('end_time').value;
    const start_time = startDate && startTime ? `${startDate}T${startTime}` : '';
    const end_time = endDate && endTime ? `${endDate}T${endTime}` : '';
    const formData = new FormData(form);
    formData.set('start_time', start_time);
    formData.set('end_time', end_time);
    // Log FormData để debug
    for (let [key, value] of formData.entries()) {
      console.log('FormData:', key, value);
    }
    let url = API_URL;
    let method = 'POST';
    if (editingEventId) {
      url += '/' + editingEventId;
      method = 'PUT';
    }
    fetch(url, {
      method,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        modal.style.display = 'none';
        fetchEvents();
        // Reset input file sau khi submit thành công
        if (imageInput) imageInput.value = '';
      })
      .catch(() => alert('Lưu sự kiện thất bại!'));
  };

  // Preview ảnh khi chọn file
  if (imageDropArea && imageInput) {
    imageDropArea.addEventListener('click', (e) => {
      // Chỉ trigger khi click trực tiếp vào drop area hoặc text, không phải khi click vào input
      if (e.target === imageDropArea || e.target === imageDropText) {
        imageInput.value = '';
        imageInput.click();
      }
    });
    imageDropArea.addEventListener('dragover', e => {
      e.preventDefault();
      imageDropArea.style.border = '2.5px solid #e91e63';
    });
    imageDropArea.addEventListener('dragleave', e => {
      e.preventDefault();
      imageDropArea.style.border = '2px dashed #f8bbd0';
    });
    imageDropArea.addEventListener('drop', e => {
      e.preventDefault();
      imageDropArea.style.border = '2px dashed #f8bbd0';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        imageInput.files = e.dataTransfer.files;
        showImagePreview(imageInput.files[0]);
      }
    });
    imageInput.addEventListener('change', e => {
      if (imageInput.files && imageInput.files[0]) {
        showImagePreview(imageInput.files[0]);
      } else {
        imagePreview.innerHTML = '';
      }
    });
  }
  function showImagePreview(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-width:120px;max-height:90px;border-radius:8px;box-shadow:0 2px 8px #f8bbd0;">`;
    };
    reader.readAsDataURL(file);
  }

  // Xử lý click sửa/xóa/xem đăng ký
  tableBody.onclick = function(e) {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('edit')) {
      fetch(API_URL + '/' + id, {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(res => res.json())
        .then(event => {
          editingEventId = id;
          formTitle.textContent = 'Sửa sự kiện';
          form.title.value = event.title;
          form.description.value = event.description;
          form.start_time.value = event.start_time.slice(0, 16);
          form.end_time.value = event.end_time.slice(0, 16);
          form.location.value = event.location;
          modal.style.display = 'block';
        });
    }
    if (e.target.classList.contains('delete')) {
      if (confirm('Bạn chắc chắn muốn xóa sự kiện này?')) {
        fetch(API_URL + '/' + id, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(res => res.json())
          .then(() => fetchEvents());
      }
    }
    if (e.target.classList.contains('registrations')) {
      showRegistrations(id);
    }
  };

  // Modal đăng ký sự kiện
  const registrationsModal = document.getElementById('registrationsModal');
  const closeRegistrationsModal = document.getElementById('closeRegistrationsModal');
  const registrationsTableBody = document.querySelector('#registrationsTable tbody');
  const eventInfoDiv = document.getElementById('eventInfo');

  // Hàm mở modal và load danh sách đăng ký
  window.showRegistrations = function(eventId) {
    registrationsModal.style.display = 'block';
    // Lấy token nếu cần xác thực
    const token = localStorage.getItem('token');
    // Lấy thông tin sự kiện
    fetch(`http://localhost:5000/api/events/${eventId}`)
      .then(res => res.json())
      .then(event => {
        eventInfoDiv.innerHTML = `
          <div class='event-info'><span class='icon'><i class='fa fa-calendar'></i></span>
          <b>${event.title}</b> | <span>${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}</span> | <span>${event.location || ''}</span></div>
        `;
      });
    // Lấy danh sách đăng ký
    fetch(`http://localhost:5000/api/events/${eventId}/registrations`, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    })
      .then(res => res.json())
      .then(data => renderRegistrations(data))
      .catch(() => registrationsTableBody.innerHTML = '<tr><td colspan="6">Không thể tải danh sách đăng ký!</td></tr>');
  }

  function renderRegistrations(registrations) {
    if (!registrations.length) {
      registrationsTableBody.innerHTML = '<tr><td colspan="6">Chưa có ai đăng ký sự kiện này.</td></tr>';
      return;
    }
    registrationsTableBody.innerHTML = registrations.map((reg, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${reg.name}</td>
        <td>${reg.email}</td>
        <td>${reg.phone || ''}</td>
        <td>${reg.other_info || ''}</td>
        <td>${new Date(reg.createdAt).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  // Đóng modal
  closeRegistrationsModal.onclick = function() {
    registrationsModal.style.display = 'none';
    registrationsTableBody.innerHTML = '';
    eventInfoDiv.innerHTML = '';
  }
  window.onclick = function(event) {
    if (event.target === registrationsModal) {
      registrationsModal.style.display = 'none';
      registrationsTableBody.innerHTML = '';
      eventInfoDiv.innerHTML = '';
    }
  }

  // Khởi động
  fetchEvents();

  const logoutBtn = document.getElementById('adminLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = '/index.html';
    });
  }

  // Sidebar tab switching
  const sidebarLinks = document.querySelectorAll('.sidebar nav a');
  const eventCard = document.querySelector('.card');
  const userCard = document.getElementById('userCard');
  const statsCard = document.getElementById('statsCard');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      if (this.textContent.includes('Sự kiện')) {
        if (eventCard) eventCard.style.display = '';
        if (userCard) userCard.style.display = 'none';
        if (statsCard) statsCard.style.display = 'none';
      } else if (this.textContent.includes('Người dùng')) {
        if (eventCard) eventCard.style.display = 'none';
        if (userCard) userCard.style.display = '';
        if (statsCard) statsCard.style.display = 'none';
        renderUsersTable();
      } else if (this.textContent.includes('Thống kê')) {
        if (eventCard) eventCard.style.display = 'none';
        if (userCard) userCard.style.display = 'none';
        if (statsCard) statsCard.style.display = '';
        renderStats();
      }
    });
  });

  // Mẫu render user giả lập
  function renderUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '<tr><td colspan="8">Đang tải...</td></tr>';
    // Lấy token nếu có
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/users', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    })
      .then(res => res.json())
      .then(users => {
        tbody.innerHTML = '';
        if (!Array.isArray(users) || users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8">Không có người dùng nào.</td></tr>';
          return;
        }
        users.forEach((u, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${i+1}</td>
            <td>${u.name || ''}</td>
            <td>${u.email || ''}</td>
            <td>${u.gender || ''}</td>
            <td>${u.birthday || ''}</td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : ''}</td>
            <td>${u.status || 'Hoạt động'}</td>
            <td>
              <button class="btn-main btn-small">Xem</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      })
      .catch(() => {
        tbody.innerHTML = '<tr><td colspan="8">Lỗi tải dữ liệu người dùng.</td></tr>';
      });
  }

  // Xử lý nút Xem chi tiết user
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-main') && e.target.textContent.trim() === 'Xem') {
      const tr = e.target.closest('tr');
      if (!tr) return;
      const tds = tr.querySelectorAll('td');
      // Lấy thông tin user từ các cột
      const user = {
        name: tds[1]?.textContent || '',
        email: tds[2]?.textContent || '',
        gender: tds[3]?.textContent || '',
        birthday: tds[4]?.textContent || '',
        createdAt: tds[5]?.textContent || '',
        status: tds[6]?.textContent || ''
      };
      const modal = document.getElementById('userDetailModal');
      const content = document.getElementById('userDetailContent');
      content.innerHTML = `
        <div style="margin-bottom:12px;text-align:center;">
          <i class="fa fa-user-circle" style="font-size:3rem;color:#e91e63;"></i>
        </div>
        <div><b>Tên:</b> ${user.name}</div>
        <div><b>Email:</b> ${user.email}</div>
        <div><b>Giới tính:</b> ${user.gender}</div>
        <div><b>Ngày sinh:</b> ${user.birthday}</div>
        <div><b>Ngày tạo:</b> ${user.createdAt}</div>
        <div><b>Trạng thái:</b> ${user.status}</div>
      `;
      modal.style.display = 'block';
    }
    if (e.target.id === 'closeUserDetailModal') {
      document.getElementById('userDetailModal').style.display = 'none';
    }
  });

  // Render dữ liệu mẫu cho thống kê
  function renderStats() {
    // Lấy token nếu có
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/users/stats', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    })
      .then(res => res.json())
      .then(stats => {
        document.getElementById('statTotalUsers').textContent = stats.total;
        // Dữ liệu mẫu cho ongoing events, registrations (có thể fetch thêm nếu cần)
        document.getElementById('statOngoingEvents').textContent = '...';
        document.getElementById('statTotalRegistrations').textContent = '...';
        // Biểu đồ tăng trưởng người dùng
        const ctxGrowth = document.getElementById('userGrowthChart').getContext('2d');
        if (window.userGrowthChart) window.userGrowthChart.destroy();
        window.userGrowthChart = new Chart(ctxGrowth, {
          type: 'line',
          data: {
            labels: stats.months,
            datasets: [{
              label: 'Người dùng mới',
              data: stats.growth,
              borderColor: '#e91e63',
              backgroundColor: 'rgba(233,30,99,0.08)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } }
          }
        });
        // Biểu đồ tỉ lệ giới tính
        const ctxGender = document.getElementById('genderPieChart').getContext('2d');
        if (window.genderPieChart) window.genderPieChart.destroy();
        window.genderPieChart = new Chart(ctxGender, {
          type: 'pie',
          data: {
            labels: ['Nam', 'Nữ', 'Khác'],
            datasets: [{
              data: [stats.gender.male, stats.gender.female, stats.gender.other],
              backgroundColor: ['#42a5f5', '#ec407a', '#ffd600']
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      })
      .catch(() => {
        document.getElementById('statTotalUsers').textContent = 'Lỗi';
      });
  }
}); 