const db = require('../models');
const Event = db.Event;
const EventRegistration = db.EventRegistration;

// Lấy danh sách sự kiện
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({ order: [['start_time', 'DESC']] });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
};

// Lấy chi tiết 1 sự kiện
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
};

// Tạo sự kiện (admin)
exports.createEvent = async (req, res) => {
  try {
    console.log('File upload:', req.file);
    console.log('Body:', req.body);
    let imagePath = null;
    if (req.file) {
      imagePath = '/uploads/events/' + req.file.filename;
    }
    const event = await Event.create({ ...req.body, image: imagePath });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: 'Tạo sự kiện thất bại', error: err });
  }
};

// Sửa sự kiện (admin)
exports.updateEvent = async (req, res) => {
  try {
    console.log('File upload:', req.file);
    console.log('Body:', req.body);
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    let imagePath = event.image;
    if (req.file) {
      imagePath = '/uploads/events/' + req.file.filename;
    }
    await event.update({ ...req.body, image: imagePath });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: 'Cập nhật sự kiện thất bại', error: err });
  }
};

// Xóa sự kiện (admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    await event.destroy();
    res.json({ message: 'Đã xóa sự kiện' });
  } catch (err) {
    res.status(500).json({ message: 'Xóa sự kiện thất bại', error: err });
  }
};

// Đăng ký sự kiện (user)
exports.registerEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    const registration = await EventRegistration.create({
      event_id: req.params.id,
      user_id: req.user ? req.user.id : null, // Nếu có đăng nhập
      ...req.body
    });
    res.status(201).json(registration);
  } catch (err) {
    res.status(400).json({ message: 'Đăng ký thất bại', error: err });
  }
};

// Lấy danh sách người đăng ký của 1 sự kiện (admin)
exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const registrations = await EventRegistration.findAll({
      where: { event_id: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
}; 