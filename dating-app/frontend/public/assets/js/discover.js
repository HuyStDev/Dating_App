document.addEventListener("sectionChanged", (e) => {
  if (e.detail.section === "discover") {
    initDiscover(e.detail);
  }
});

let isDiscoverInitialized = false;

function initDiscover(detail) {
  if (isDiscoverInitialized) return;

  const { token, userData } = detail;
  const backendUrl = "http://localhost:5000";

  const loadingIndicator = document.getElementById("loading");
  const emptyState = document.getElementById("emptyState");
  const profileCard = document.getElementById("profileCard");
  const profileName = document.getElementById("profileName");
  const profileAge = document.getElementById("profileAge");
  const profileBio = document.getElementById("profileBio");
  const profileJob = document.getElementById("profileJob");
  const profileHobbies = document.getElementById("profileHobbies");
  const currentImage = document.getElementById("currentImage");
  const imageIndicators = document.getElementById("imageIndicators");
  const likeBtn = document.getElementById("likeBtn");
  const dislikeBtn = document.getElementById("dislikeBtn");
  const prevPhotoBtn = document.getElementById("prevPhotoBtn");
  const nextPhotoBtn = document.getElementById("nextPhotoBtn");
  const genderFilter = document.getElementById("genderFilter");
  const refreshBtn = document.getElementById("refreshBtn");
  const matchModal = document.getElementById("matchModal");
  const matchNameSpan = document.getElementById("matchName");
  const minAgeInput = document.getElementById("minAge");
  const maxAgeInput = document.getElementById("maxAge");
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const filterDropdown = document.getElementById("filterDropdown");
  const filterForm = document.getElementById("filterForm");
  const closeFilterBtn = document.getElementById("closeFilterBtn");
  const profileHeight = document.getElementById("profileHeight");
  const profileWeight = document.getElementById("profileWeight");
  const toggleDetailsBtn = document.getElementById("toggleDetailsBtn");
  const profileDetailsBox = document.getElementById("profileDetailsBox");
  const minDistanceInput = document.getElementById("minDistance");
  const maxDistanceInput = document.getElementById("maxDistance");
  const distanceMinLabel = document.getElementById("distanceMinLabel");
  const distanceMaxLabel = document.getElementById("distanceMaxLabel");

  let currentProfile = null;
  let currentPhotoList = [];
  let currentPhotoIdx = 0;

  // Khởi tạo slider khoảng cách
  let minDistance = 0;
  let maxDistance = 30;
  const distanceSlider = document.getElementById("distanceSlider");
  const distanceSliderValue = document.getElementById("distanceSliderValue");
  if (distanceSlider && window.noUiSlider) {
    noUiSlider.create(distanceSlider, {
      start: [minDistance, maxDistance],
      connect: true,
      step: 1,
      range: {
        min: 0,
        max: 100,
      },
      tooltips: false,
      format: {
        to: function (value) { return Math.round(value); },
        from: function (value) { return Number(value); }
      }
    });
    distanceSlider.noUiSlider.on('update', function(values) {
      minDistance = values[0];
      maxDistance = values[1];
      if (distanceMinLabel) distanceMinLabel.textContent = minDistance;
      if (distanceMaxLabel) distanceMaxLabel.textContent = maxDistance;
    });
  }

  function showLoading(isLoading) {
    if (loadingIndicator)
      loadingIndicator.style.display = isLoading ? "flex" : "none";
    if (isLoading) {
      if (profileCard) profileCard.style.display = "none";
      if (emptyState) emptyState.style.display = "none";
    }
  }

  function showEmptyState(isShown) {
    if (profileCard) profileCard.style.display = isShown ? "none" : "block";
    if (emptyState) emptyState.style.display = isShown ? "flex" : "none";
  }

  function showMatchPopup(matchedUserName) {
    if (!matchModal || !matchNameSpan) return;
    matchNameSpan.textContent = matchedUserName;
    matchModal.classList.add("visible");
    setTimeout(() => {
      matchModal.classList.remove("visible");
    }, 3000); // Ẩn sau 3 giây
  }

  function setupProfileSlider(photoList) {
    currentPhotoList =
      photoList && photoList.length > 0
        ? photoList
        : ["./assets/images/default-avatar.jpg"];
    currentPhotoIdx = 0;
    showProfilePhoto();
    updatePhotoIndicators();
  }

  function showProfilePhoto() {
    if (currentImage) {
      if (prevPhotoBtn) prevPhotoBtn.disabled = true;
      if (nextPhotoBtn) nextPhotoBtn.disabled = true;
      currentImage.onload = function () {
        if (prevPhotoBtn) prevPhotoBtn.disabled = false;
        if (nextPhotoBtn) nextPhotoBtn.disabled = false;
        updatePhotoIndicators();
      };
      currentImage.src = currentPhotoList[currentPhotoIdx];
      if (currentImage.complete) {
        currentImage.onload();
      }
    }
  }

  function updatePhotoIndicators() {
    if (!imageIndicators) return;
    imageIndicators.innerHTML = "";
    if (currentPhotoList.length > 1) {
      currentPhotoList.forEach((_, index) => {
        const indicator = document.createElement("div");
        indicator.className = "indicator";
        if (index === currentPhotoIdx) {
          indicator.classList.add("active");
        }
        imageIndicators.appendChild(indicator);
      });
    }
  }

  function changePhoto(direction) {
    if (currentPhotoList.length <= 1) return;
    currentPhotoIdx =
      (currentPhotoIdx + direction + currentPhotoList.length) %
      currentPhotoList.length;
    showProfilePhoto();
    updatePhotoIndicators();
  }

  // Hàm lấy vị trí hiện tại (promise)
  function getCurrentPositionPromise() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => resolve(null)
      );
    });
  }

  async function displayUserProfile(user) {
    if (!user || !profileCard) {
      showEmptyState(true);
      return;
    }
    showEmptyState(false);
    profileCard.dataset.userId = user.id;
    currentProfile = user;

    // Cập nhật tên, tuổi, giới tính, vị trí, bio
    const profileName = document.getElementById("profileName");
    const profileAge = document.getElementById("profileAge");
    const profileGender = document.getElementById("profileGender");
    const profileBio = document.getElementById("profileBio");
    const profileLocation = document.getElementById("profileLocation");
    const profileHobbiesTags = document.getElementById("profileHobbiesTags");
    const profileHeight = document.getElementById("profileHeight");
    const profileWeight = document.getElementById("profileWeight");

    if (profileName) profileName.textContent = user.name || "";
    if (profileAge) {
      let ageText = user.age ? user.age : "";
      if (user.distance !== undefined && user.distance !== null) {
        ageText += ` <span class='profile-age-distance'><i class='fas fa-map-marker-alt'></i> ${user.distance} km</span>`;
      }
      profileAge.innerHTML = ageText;
    }
    if (profileGender) {
      const genderMap = { nam: "Nam", nữ: "Nữ", khác: "Khác" };
      let genderIcon = "";
      let genderClass = "";
      if (user.gender === "nam") {
        genderIcon = '<i class="fas fa-mars gender-icon gender-male"></i>';
        genderClass = "gender-male";
      } else if (user.gender === "nữ") {
        genderIcon = '<i class="fas fa-venus gender-icon gender-female"></i>';
        genderClass = "gender-female";
      } else {
        genderIcon = '<i class="fas fa-genderless gender-icon"></i>';
        genderClass = "";
      }
      profileGender.innerHTML = `${genderIcon} <span class="${genderClass}">${
        genderMap[user.gender] || ""
      }</span>`;
    }
    if (profileBio) profileBio.textContent = user.bio || "";
    if (profileLocation)
      profileLocation.textContent = user.location ? `📍 ${user.location}` : "";
    if (profileHeight)
      profileHeight.innerHTML = `<i class='fas fa-ruler-vertical'></i> ${
        user.height ? user.height + " cm" : "-- cm"
      }`;
    if (profileWeight)
      profileWeight.innerHTML = `<i class='fas fa-weight-hanging'></i> ${
        user.weight ? user.weight + " kg" : "-- kg"
      }`;
    // Render badge sở thích
    if (profileHobbiesTags) {
      profileHobbiesTags.innerHTML = "";
      if (user.hobbies) {
        let hobbiesArr = Array.isArray(user.hobbies)
          ? user.hobbies
          : user.hobbies
              .split(/[,;|]/)
              .map((h) => h.trim())
              .filter(Boolean);
        hobbiesArr.forEach((hobby) => {
          const badge = document.createElement("span");
          badge.className = "hobby-badge";
          badge.textContent = hobby;
          profileHobbiesTags.appendChild(badge);
        });
      }
    }
    // Ẩn các phần chi tiết cũ nếu còn
    const userDetails = document.querySelector(".user-details");
    if (userDetails) userDetails.style.display = "none";

    try {
      const res = await fetch(`${backendUrl}/api/users/${user.id}/photos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch photos with status: ${res.status}`);
      }
      const photos = await res.json();
      let photoUrls = photos.map((p) => backendUrl + p.photo_url);
      if (user.profile_picture) {
        const avatarUrl = backendUrl + user.profile_picture;
        photoUrls = photoUrls.filter((url) => url !== avatarUrl);
        photoUrls.unshift(avatarUrl);
      }
      setupProfileSlider(photoUrls);
    } catch (error) {
      console.error("Error fetching photos:", error);
      setupProfileSlider([]);
    }
  }

  async function handleSwipe(action) {
    if (!currentProfile) return;

    // Thêm hiệu ứng cho card khi nhấn nút
    const card = document.querySelector(".profile-card");
    if (card) {
      const direction = action === "like" ? 1 : -1;
      card.style.transition = "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)";
      card.style.transform = `translateX(${direction * 300}px) rotate(${
        direction * 15
      }deg)`;

      setTimeout(() => {
        card.style.transition = "";
        card.style.transform = "";
      }, 300);
    }

    try {
      const response = await fetch(`${backendUrl}/api/swipe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId: currentProfile.id,
          action: action,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Swipe failed");
      }

      const result = await response.json();
      if (result.matched) {
        showMatchPopup(currentProfile.name);
      }

      loadPotentialMatches();
    } catch (error) {
      console.error("Swipe error:", error);
      alert(`Đã có lỗi xảy ra: ${error.message}`);
      loadPotentialMatches();
    }
  }

  async function loadPotentialMatches() {
    showLoading(true);
    try {
      const gender = genderFilter ? genderFilter.value : "";
      const minAge = minAgeInput ? minAgeInput.value : "";
      const maxAge = maxAgeInput ? maxAgeInput.value : "";
      // Lấy min/max distance từ slider
      let minDistanceVal = minDistance;
      let maxDistanceVal = maxDistance;
      let url = `${backendUrl}/api/users`;
      const params = [];
      if (gender) params.push(`gender=${encodeURIComponent(gender)}`);
      if (minAge) params.push(`minAge=${encodeURIComponent(minAge)}`);
      if (maxAge) params.push(`maxAge=${encodeURIComponent(maxAge)}`);
      if (minDistanceVal !== undefined) params.push(`minDistance=${encodeURIComponent(minDistanceVal)}`);
      if (maxDistanceVal !== undefined) params.push(`maxDistance=${encodeURIComponent(maxDistanceVal)}`);
      // Lấy vị trí hiện tại
      const pos = await getCurrentPositionPromise();
      if (pos) {
        params.push(`lat=${pos.coords.latitude}`);
        params.push(`lng=${pos.coords.longitude}`);
      }
      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const users = await response.json();
      if (users && users.length > 0) {
        displayUserProfile(users[0]);
      } else {
        showEmptyState(true);
      }
    } catch (error) {
      console.error("Could not load potential matches:", error);
      showEmptyState(true);
    } finally {
      showLoading(false);
    }
  }

  if (likeBtn) likeBtn.addEventListener("click", () => handleSwipe("like"));
  if (dislikeBtn)
    dislikeBtn.addEventListener("click", () => handleSwipe("dislike"));
  if (prevPhotoBtn)
    prevPhotoBtn.addEventListener("click", () => changePhoto(-1));
  if (nextPhotoBtn)
    nextPhotoBtn.addEventListener("click", () => changePhoto(1));

  // Hiện/ẩn dropdown filter
  if (filterToggleBtn && filterDropdown) {
    filterToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      filterDropdown.classList.toggle("active");
    });
    // Ẩn dropdown khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (!filterDropdown.contains(e.target) && e.target !== filterToggleBtn) {
        filterDropdown.classList.remove("active");
      }
    });
  }
  // Đóng dropdown khi bấm nút Đóng
  if (closeFilterBtn && filterDropdown) {
    closeFilterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      filterDropdown.classList.remove("active");
    });
  }
  // Khi submit form filter thì lọc và ẩn dropdown
  if (filterForm) {
    filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      loadPotentialMatches();
      filterDropdown.classList.remove("active");
    });
  }

  if (toggleDetailsBtn && profileDetailsBox) {
    toggleDetailsBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      profileDetailsBox.classList.toggle("hidden-details");
      // Đổi icon
      const icon = toggleDetailsBtn.querySelector("i");
      if (profileDetailsBox.classList.contains("hidden-details")) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  loadPotentialMatches();

  isDiscoverInitialized = true;
}

// --- Sự kiện quảng cáo sidebar ---
async function fetchOngoingEvents() {
  try {
    const res = await fetch('http://localhost:5000/api/events');
    const events = await res.json();
    const now = new Date();
    return events.filter(ev => new Date(ev.end_time) >= now);
  } catch (e) {
    return [];
  }
}

function renderEventAdsSidebar(events) {
  const sidebar = document.getElementById('eventAdsList');
  if (!sidebar) return;
  sidebar.innerHTML = '';
  const backendUrl = "http://localhost:5000";
  if (events.length === 0) {
    sidebar.innerHTML = '<p>Không có sự kiện nào đang diễn ra.</p>';
    return;
  }
  events.forEach(ev => {
    let imageSrc = ev.image
      ? (ev.image.startsWith('/uploads') ? backendUrl + ev.image : ev.image)
      : './assets/images/default-event.jpg';
    const card = document.createElement('div');
    card.className = 'event-ads-card';
    card.innerHTML = `
      <img src="${imageSrc}" alt="Sự kiện">
      <div class="event-title">${ev.title}</div>
      <div class="event-date">${formatEventDate(ev.start_time, ev.end_time)}</div>
    `;
    sidebar.appendChild(card);
  });
}

function formatEventDate(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString('vi-VN');
  }
  return `${s.toLocaleDateString('vi-VN')} - ${e.toLocaleDateString('vi-VN')}`;
}

function setupEventAdsSidebarListener() {
  const eventAdsSidebar = document.getElementById('eventAdsSidebar');
  if (eventAdsSidebar && !eventAdsSidebar._listenerAdded) {
    eventAdsSidebar.addEventListener('click', function(e) {
      if (e.target.classList.contains('view-detail-btn') || (e.target.closest && e.target.closest('.view-detail-btn'))) {
        const btn = e.target.classList.contains('view-detail-btn') ? e.target : e.target.closest('.view-detail-btn');
        const eventId = btn.getAttribute('data-event-id');
        // Chuyển sang section sự kiện
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById('eventSection').classList.add('active');
        // Kích hoạt tab nav sự kiện
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const navEvent = document.querySelector('.nav-link[data-section="event"]');
        if (navEvent) navEvent.classList.add('active');
        // Gọi hàm showEventDetailById nếu có
        if (typeof showEventDetailById === 'function') {
          showEventDetailById(eventId);
        } else {
          window.selectedEventId = eventId;
        }
      }
    });
    eventAdsSidebar._listenerAdded = true;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.innerWidth >= 1024) {
    const events = await fetchOngoingEvents();
    renderEventAdsSidebar(events);
    setupEventAdsSidebarListener();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const eyeBtn = document.getElementById('eventSidebarEye');
  if (eyeBtn) {
    eyeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
      document.getElementById('eventSection').classList.add('active');
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const navEvent = document.querySelector('.nav-link[data-section="event"]');
      if (navEvent) navEvent.classList.add('active');
    });
  }
  // Xử lý nút sự kiện ở bottom-nav mobile
  const mobileEventBtn = document.getElementById('mobileEventBtn');
  if (mobileEventBtn) {
    mobileEventBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
      document.getElementById('eventSection').classList.add('active');
      document.querySelectorAll('.bottom-nav-link').forEach(l => l.classList.remove('active'));
      mobileEventBtn.classList.add('active');
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const navEvent = document.querySelector('.nav-link[data-section="event"]');
      if (navEvent) navEvent.classList.add('active');
    });
  }
});
// --- Kết thúc sidebar sự kiện ---
