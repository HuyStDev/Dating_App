const express = require("express");
const router = express.Router();
const { authenticate } = require("../utils/authUtils");
const messageController = require("../controllers/messageController");

router.use(authenticate);

router.post("/", messageController.uploadImage, messageController.sendMessage);
router.get("/", messageController.getMessages);
router.get("/liked-you", messageController.getUsersLikedYou);
router.get("/matched-users", messageController.getMatchedUsers);
router.delete("/liked-users/:id", messageController.deleteLike);
router.delete("/match/:id", messageController.deleteMatch);
router.post("/restore/:id", messageController.restoreMatch);
router.get("/deleted", messageController.getDeletedMatches);
router.put("/mark-read/:senderId", messageController.markMessagesAsRead);

module.exports = router;
