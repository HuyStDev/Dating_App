document.addEventListener('DOMContentLoaded', function() {
  // Lấy eventId từ query string
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');
  const API_URL = `https://dating-app-pzb4.onrender.com/api/events/${eventId}/registrations`;
  const EVENT_INFO_URL = `https://dating-app-pzb4.onrender.com/api/events/${eventId}`;
  const tableBody = document.querySelector('#registrationsTable tbody');
  const eventInfoDiv = document.getElementById('eventInfo');

  // Lấy token nếu cần xác thực (nếu backend yêu cầu)
  const token = localStorage.getItem('token');

  // Hiển thị thông tin sự kiện
  fetch(EVENT_INFO_URL)
    .then(res => res.json())
    .then(event => {
      eventInfoDiv.innerHTML = `
        <div style="margin-bottom:12px;">
          <b>${event.title}</b> | <span>${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}</span> | <span>${event.location || ''}</span>
        </div>
      `;
    });

  // Lấy danh sách đăng ký
  fetch(API_URL, {
    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
  })
    .then(res => res.json())
    .then(data => renderRegistrations(data))
    .catch(() => tableBody.innerHTML = '<tr><td colspan="6">Không thể tải danh sách đăng ký!</td></tr>');

  function renderRegistrations(registrations) {
    if (!registrations.length) {
      tableBody.innerHTML = '<tr><td colspan="6">Chưa có ai đăng ký sự kiện này.</td></tr>';
      return;
    }
    tableBody.innerHTML = registrations.map((reg, idx) => `
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
}); 