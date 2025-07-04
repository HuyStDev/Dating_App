const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../utils/authUtils');
const eventRoutes = require('./eventRoutes');

// Không dùng authenticate cho toàn bộ /api
// Chỉ dùng authenticate cho các route cần bảo vệ

router.use('/events', eventRoutes); // /api/events KHÔNG bị authenticate

// Các route dưới đây mới cần authenticate
router.use(authenticate);

router.get('/users', userController.getPotentialMatches);
router.post('/swipe', userController.handleSwipe);
router.put('/profile', userController.updateProfile);
router.post('/profile/avatar', ...userController.uploadAvatar);
router.get('/profile', userController.getProfile);

// Thêm route upload nhiều ảnh
router.post('/profile/photos', ...userController.uploadUserPhotos);

// Lấy danh sách ảnh của user (của mình hoặc user khác)
router.get('/users/:id/photos', userController.getUserPhotos);
router.get('/profile/photos', userController.getUserPhotos); // lấy ảnh của chính mình
router.delete('/profile/photos/:photoId', userController.deleteUserPhoto);

router.put('/profile/location', userController.updateLocation);

router.get('/users/stats', userController.getUserStats);

module.exports = router;