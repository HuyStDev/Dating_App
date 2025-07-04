// Di chuyển các biến cần tồn tại lâu dài ra ngoài scope của hàm init
let isProfileInitialized = false;
let token = null;
const backendUrl = 'https://dating-app-pzb4.onrender.com';

// Đưa tất cả các hàm ra ngoài scope của init
// để chúng có thể được gọi lại mà không cần khởi tạo lại từ đầu.

// Hàm tải và hiển thị dữ liệu ở chế độ xem
async function loadProfilePreview() {
  try {
    if (!token) return; // Nếu chưa có token thì không làm gì cả
    const res = await fetch(`${backendUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Không thể tải hồ sơ");

    const user = await res.json();

    // Lưu user đầy đủ vào localStorage để các nơi khác dùng (ví dụ: chat share link)
    localStorage.setItem('userFull', JSON.stringify(user));

    // Hiển thị thông tin xem trước
    const defaultAvatar = "./assets/images/default-avatar.jpg";
    document.getElementById("previewProfileImage").src = user.profile_picture
      ? `${backendUrl}${user.profile_picture}`
      : defaultAvatar;

    document.getElementById("previewProfileName").textContent =
      user.name || "Chưa cập nhật";
    document.getElementById("previewProfileAge").textContent = user.age
      ? `${user.age} tuổi`
      : "Chưa cập nhật";
    // Sửa hiển thị giới tính cho rõ ràng
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
    document.getElementById(
      "previewProfileGender"
    ).innerHTML = `${genderIcon} <span class="${genderClass}">${
      genderMap[user.gender] || "Chưa cập nhật"
    }</span>`;
    document.getElementById("previewProfileBio").textContent =
      user.bio || "Chưa có giới thiệu";

    const birthdayEl = document.getElementById("previewProfileBirthday");
    if (user.birthday) {
      // Định dạng lại để input[type=date] có thể đọc
      const date = new Date(user.birthday);
      const formattedDate = date.toISOString().split("T")[0];
      birthdayEl.textContent = new Date(formattedDate).toLocaleDateString(
        "vi-VN"
      );
      birthdayEl.dataset.originalValue = formattedDate;
    } else {
      birthdayEl.textContent = "Chưa cập nhật";
      birthdayEl.dataset.originalValue = "";
    }

    document.getElementById("previewProfileHeight").innerHTML = user.height
      ? `${user.height} cm`
      : "Chưa cập nhật";
    document.getElementById("previewProfileWeight").innerHTML = user.weight
      ? `${user.weight} kg`
      : "Chưa cập nhật";
    document.getElementById("previewProfileJob").textContent =
      user.job || "Chưa cập nhật";
    document.getElementById("previewProfileHobbies").textContent =
      user.hobbies || "Chưa cập nhật";

    // Sở thích dạng badge
    let hobbiesArr = [];
    if (user.hobbies) {
      hobbiesArr = user.hobbies.split(/[,;|]/).map(h => h.trim()).filter(Boolean);
    }
    renderHobbies(hobbiesArr);

    // Hiển thị social links
    const socialLinks = [
      { key: 'facebook', icon: 'fab fa-facebook', label: 'Facebook', el: 'previewProfileFacebook' },
      { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram', el: 'previewProfileInstagram' },
      { key: 'tiktok', icon: 'fab fa-tiktok', label: 'TikTok', el: 'previewProfileTiktok' },
      { key: 'zalo', icon: 'fas fa-comment', label: 'Zalo', el: 'previewProfileZalo' }
    ];
    socialLinks.forEach(link => {
      const el = document.getElementById(link.el);
      if (!el) return;
      if (user[link.key]) {
        el.innerHTML = `<button class='social-link-btn' onclick="window.open('${user[link.key]}','_blank')"><i class='${link.icon}'></i> ${link.label}</button>`;
        el.style.opacity = 1;
      } else {
        el.innerHTML = `<button class='social-link-btn' disabled style='opacity:0.5;cursor:not-allowed;'><i class='${link.icon}'></i> ${link.label}</button>`;
        el.style.opacity = 0.7;
      }
    });

    await loadUserPhotos();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Hàm tải danh sách ảnh của user
async function loadUserPhotos() {
  if (!token) return;
  const res = await fetch(`${backendUrl}/api/profile/photos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const photos = await res.json();
  const gallery = document.getElementById("userPhotosGallery");
  gallery.innerHTML = ""; // Xóa ảnh cũ
  photos.forEach((photo) => {
    const photoItem = document.createElement("div");
    photoItem.className = "photo-item";
    photoItem.innerHTML = `
            <img src="${backendUrl}${photo.photo_url}" alt="User photo">
            <button class="delete-photo-btn" data-photoid="${photo.id}">&times;</button>
        `;
    gallery.appendChild(photoItem);
  });

  // Thêm ô "Add photo" vào cuối
  const addPhotoPlaceholder = document.createElement("div");
  addPhotoPlaceholder.className = "add-photo-placeholder";
  addPhotoPlaceholder.innerHTML = `<i class="fas fa-plus"></i>`;
  addPhotoPlaceholder.addEventListener("click", () => {
    // This should trigger the hidden file input for adding gallery photos
    // Assuming you have an input like: <input type="file" id="editPhotos" multiple hidden>
    document.getElementById("editPhotos").click();
  });
  gallery.appendChild(addPhotoPlaceholder);
}

// Hàm xử lý khi submit form
async function handleProfileUpdate(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // 1. Gửi thông tin văn bản
  const textData = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "avatar" && key !== "photos") {
      textData[key] = value; // Gửi cả giá trị rỗng để backend xử lý
    }
  }

  try {
    const updateRes = await fetch(`${backendUrl}/api/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textData),
    });

    // Nếu request không thành công, đọc lỗi từ server và hiển thị
    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      // Ném lỗi với thông báo từ server
      throw new Error(errorData.message || "Lỗi cập nhật không xác định");
    }

    // 2. Upload avatar nếu có file mới
    const avatarFile = formData.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      const avatarFormData = new FormData();
      avatarFormData.append("avatar", avatarFile);
      const avatarRes = await fetch(`${backendUrl}/api/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: avatarFormData,
      });
      if (!avatarRes.ok) throw new Error("Lỗi upload avatar");
    }

    // Upload ảnh gallery đã được tách ra, nên không cần xử lý ở đây nữa

    alert("Cập nhật thành công!");
    await loadProfilePreview();
  } catch (error) {
    console.error("Update profile error:", error);
    alert(error.message);
  }
}

// Hàm xử lý upload ảnh mới
async function handleNewPhotosUpload() {
  const photosInput = document.getElementById("editPhotos");
  const files = photosInput.files;
  if (files.length === 0) return;

  const photosFormData = new FormData();
  for (const file of files) {
    photosFormData.append("photos", file);
  }

  try {
    const photosRes = await fetch(`${backendUrl}/api/profile/photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: photosFormData,
    });
    if (!photosRes.ok) throw new Error("Lỗi upload ảnh gallery");

    // Tải lại danh sách ảnh để hiển thị ảnh mới
    await loadUserPhotos();
  } catch (error) {
    console.error("Upload photos error:", error);
    alert(error.message);
  }
}

// Hàm xóa ảnh
async function deletePhoto(photoId) {
  if (!confirm("Bạn có chắc muốn xóa ảnh này?")) return;
  try {
    const res = await fetch(`${backendUrl}/api/profile/photos/${photoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await loadUserPhotos();
    } else {
      alert("Lỗi khi xóa ảnh");
    }
  } catch (error) {
    console.error("Delete photo error:", error);
    alert("Lỗi khi xóa ảnh");
  }
}

function updatePhotosPreview() {
  const photosInput = document.getElementById("editPhotos");
  const photosPreviewContainer = document.getElementById("photosPreview");
  if (!photosInput || !photosPreviewContainer) return;
  photosPreviewContainer.innerHTML = "";
  const files = Array.from(photosInput.files);

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview-img";
      photosPreviewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Khởi tạo chức năng chỉnh sửa trực tiếp cho một trường
 * @param {string} fieldName - Tên của trường (ví dụ: 'name')
 * @param {object} options - Các tùy chọn, ví dụ { type: 'text' } hoặc { type: 'textarea' } hoặc { type: 'select', selectOptions: [...] }
 */
function initInlineEditing(fieldName, options = {}) {
  const { type = "text", selectOptions = [], suffix = "" } = options;

  const profileSection = document.getElementById("profileSection");
  if (!profileSection) return;

  // Selector đã được sửa để tìm đúng container
  const fieldContainer = profileSection.querySelector(
    `[data-field="${fieldName}"]`
  );
  if (!fieldContainer) {
    return;
  }

  const valueElement = fieldContainer.querySelector(".field-value");
  // const labelElement = fieldContainer.querySelector('.field-label');

  const activateEditMode = (e) => {
    if (!e.target.matches(".edit-icon, .field-value, .field-value *")) return;
    if (fieldContainer.querySelector(".inline-edit-input")) return;

    const originalText = valueElement.textContent;
    const currentValue =
      valueElement.dataset.originalValue !== undefined
        ? valueElement.dataset.originalValue
        : originalText.trim().replace(suffix, "");

    let input;

    if (type === "select") {
      input = document.createElement("select");
      input.className = "inline-edit-select inline-edit-input";
      selectOptions.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        if (opt.value === currentValue) option.selected = true;
        input.appendChild(option);
      });
    } else if (type === "textarea") {
      input = document.createElement("textarea");
      input.className = "inline-edit-textarea inline-edit-input";
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.className = "inline-edit-text inline-edit-input";
      input.type = type;
    }
    input.value = currentValue;

    // Thay thế text bằng input
    valueElement.textContent = "";
    valueElement.appendChild(input);
    input.focus();

    const saveChanges = async () => {
      const newValue = input.value;
      valueElement.removeChild(input);
      valueElement.textContent = originalText; // Phục hồi text gốc tạm thời

      if (newValue.trim() !== currentValue) {
        const result = await updateProfileField(fieldName, newValue);
        if (!result.success) {
          alert(result.message);
        }
        // Luôn tải lại để đảm bảo dữ liệu mới nhất, bao gồm cả tuổi
        await loadProfilePreview();
      }
    };

    input.addEventListener("blur", saveChanges, { once: true });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && type !== "textarea") {
        e.preventDefault();
        input.blur();
      }
      if (e.key === "Escape") {
        input.removeEventListener("blur", saveChanges);
        valueElement.removeChild(input);
        valueElement.textContent = originalText;
      }
    });
  };

  fieldContainer.addEventListener("click", activateEditMode);
}

// Hàm init sẽ chỉ chạy một lần để lấy token và gán sự kiện
function initProfile() {
  if (isProfileInitialized) {
    loadProfilePreview();
    return;
  }

  // 1. DOM Elements
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  const avatarInput = document.getElementById("editAvatar");
  const photosInput = document.getElementById("editPhotos");

  // 2. Event Listeners
  if (changeAvatarBtn && avatarInput) {
    changeAvatarBtn.addEventListener("click", () => {
      avatarInput.click();
    });
    avatarInput.addEventListener("change", async () => {
      const file = avatarInput.files[0];
      if (!file) return;

      const avatarFormData = new FormData();
      avatarFormData.append("avatar", file);

      try {
        const avatarRes = await fetch(`${backendUrl}/api/profile/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: avatarFormData,
        });
        if (!avatarRes.ok) throw new Error("Lỗi upload avatar");

        showNotification("Cập nhật ảnh đại diện thành công!", "success");
        await loadProfilePreview();
      } catch (error) {
        console.error("Update avatar error:", error);
        showNotification(error.message, "error");
      }
    });
  }
  if (photosInput) {
    photosInput.addEventListener("change", handleNewPhotosUpload);
  }

  // Click delegation for delete photo buttons
  const userPhotosGallery = document.getElementById("userPhotosGallery");
  userPhotosGallery.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-photo-btn")) {
      const photoId = e.target.dataset.photoid;
      deletePhoto(photoId);
    }
  });

  // Khởi tạo chỉnh sửa inline cho tên
  initInlineEditing("name");
  // Bổ sung: Khi bấm chỉnh sửa tuổi, sẽ chuyển sang chỉnh sửa ngày sinh
  const ageField = document.querySelector('.editable-field[data-field="age"]');
  if (ageField) {
    ageField.addEventListener("click", function (e) {
      // Chuyển focus sang trường ngày sinh để chỉnh sửa
      const birthdayField = document.querySelector(
        '.editable-field[data-field="birthday"]'
      );
      if (birthdayField) {
        const editIcon = birthdayField.querySelector(".edit-icon");
        if (editIcon) editIcon.click();
      }
    });
  }
  initInlineEditing("gender", {
    type: "select",
    selectOptions: [
      { value: "nam", text: "Nam" },
      { value: "nữ", text: "Nữ" },
      { value: "khác", text: "Khác" },
    ],
  });
  initInlineEditing("bio", { type: "textarea" });

  // Kích hoạt chỉnh sửa cho các trường thông tin chi tiết
  initInlineEditing("birthday", { type: "date" });
  initInlineEditing("height", { type: "number", suffix: "cm" });
  initInlineEditing("weight", { type: "number", suffix: "kg" });
  initInlineEditing("job", { type: "text" });
  initInlineEditing("hobbies", { type: "text" });

  // Load dữ liệu lần đầu
  loadProfilePreview();
  // Lấy vị trí và gửi lên backend
  getAndSendLocation();

  // Trong initProfile, sau các trường khác:
  initInlineEditing("facebook", { type: "text" });
  initInlineEditing("instagram", { type: "text" });
  initInlineEditing("tiktok", { type: "text" });
  initInlineEditing("zalo", { type: "text" });

  isProfileInitialized = true;
}

// Listen for the sectionChanged event to initialize the profile section
document.addEventListener("sectionChanged", (e) => {
  if (e.detail.section === "profile") {
    token = e.detail.token;
    initProfile();
  }
});

async function updateProfileField(fieldName, value) {
  try {
    const res = await fetch(`${backendUrl}/api/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [fieldName]: value }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        message: errorData.message || "Cập nhật thất bại",
      };
    }
    showNotification("Cập nhật thành công!", "success");
    await loadProfilePreview();
    return { success: true };
  } catch (error) {
    console.error(`Lỗi khi cập nhật ${fieldName}:`, error);
    showNotification(error.message, "error");
    await loadProfilePreview();
    return { success: false, message: error.message };
  }
}

// Hàm gửi vị trí lên backend
async function sendLocationToBackend(location) {
  try {
    const res = await fetch(`${backendUrl}/api/profile/location`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.warn("Không thể cập nhật vị trí:", errorData.message);
    }
  } catch (error) {
    console.error("Lỗi gửi vị trí lên backend:", error);
  }
}

// Hàm lấy vị trí từ trình duyệt và gửi lên backend
function getAndSendLocation() {
  if (!navigator.geolocation) {
    console.warn("Trình duyệt không hỗ trợ lấy vị trí.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const location = `${lat},${lng}`;
      sendLocationToBackend(location);
    },
    (err) => {
      console.warn("Không lấy được vị trí:", err.message);
    }
  );
}

// Render danh sách sở thích dạng badge, thêm/xóa
function renderHobbies(hobbiesArr) {
  const hobbiesList = document.getElementById("previewProfileHobbies");
  hobbiesList.innerHTML = "";
  if (Array.isArray(hobbiesArr)) {
    hobbiesArr.forEach((hobby, idx) => {
      const badge = document.createElement("span");
      badge.className = "hobby-badge";
      badge.textContent = hobby;
      // Nút xóa
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-hobby";
      removeBtn.innerHTML = "<i class='fas fa-times'></i>";
      removeBtn.onclick = async () => {
        await updateHobbies(hobbiesArr.filter((_, i) => i !== idx));
      };
      badge.appendChild(removeBtn);
      hobbiesList.appendChild(badge);
    });
  }
}

// Cập nhật hobbies lên backend
async function updateHobbies(newArr) {
  try {
    const res = await fetch(`${backendUrl}/api/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hobbies: newArr.join(", ") }),
    });
    if (!res.ok) throw new Error("Lỗi cập nhật sở thích");
    await loadProfilePreview();
  } catch (e) {
    alert("Lỗi cập nhật sở thích");
  }
}

// Thêm sự kiện cho nút +
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addHobbyBtn");
  const hobbiesList = document.getElementById("previewProfileHobbies");
  let input = null;
  if (addBtn && hobbiesList) {
    addBtn.onclick = () => {
      if (input) return;
      input = document.createElement("input");
      input.type = "text";
      input.className = "add-hobby-input";
      input.placeholder = "Nhập sở thích...";
      input.onblur = () => { input && input.remove(); input = null; };
      input.onkeydown = async (e) => {
        if (e.key === "Enter" && input.value.trim()) {
          const current = getCurrentHobbies();
          if (!current.includes(input.value.trim())) {
            await updateHobbies([...current, input.value.trim()]);
          }
          input.remove(); input = null;
        } else if (e.key === "Escape") {
          input.remove(); input = null;
        }
      };
      hobbiesList.appendChild(input);
      input.focus();
    };
  }
});

// Lấy danh sách sở thích hiện tại từ DOM
function getCurrentHobbies() {
  return Array.from(document.querySelectorAll("#previewProfileHobbies .hobby-badge"))
    .map(badge => badge.childNodes[0].nodeValue.trim())
    .filter(Boolean);
}
