const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/events') });
// const { isAdmin, isAuthenticated } = require('../middlewares/authMiddleware');

// Lấy danh sách sự kiện (KHÔNG authenticate)
router.get('/', eventController.getAllEvents);
// Lấy chi tiết 1 sự kiện
router.get('/:id', eventController.getEventById);
// Tạo sự kiện (admin)
// router.post('/', isAdmin, eventController.createEvent);
router.post('/', upload.single('image'), eventController.createEvent);
// Sửa sự kiện (admin)
// router.put('/:id', isAdmin, eventController.updateEvent);
router.put('/:id', upload.single('image'), eventController.updateEvent);
// Xóa sự kiện (admin)
// router.delete('/:id', isAdmin, eventController.deleteEvent);
router.delete('/:id', eventController.deleteEvent);
// Đăng ký sự kiện (user)
// router.post('/:id/register', isAuthenticated, eventController.registerEvent);
router.post('/:id/register', eventController.registerEvent);
// Lấy danh sách người đăng ký của 1 sự kiện (admin)
// router.get('/:id/registrations', isAdmin, eventController.getRegistrationsByEvent);
router.get('/:id/registrations', eventController.getRegistrationsByEvent);

module.exports = router; 