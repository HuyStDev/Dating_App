const { Match, User, Message, Sequelize } = require("../models");
const { Op } = Sequelize;
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/messages");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "msg-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)"));
    }
  },
});

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận" });
    }

    // Xác định loại tin nhắn
    let messageType = "text";
    let imageUrl = null;

    if (req.file) {
      // Có ảnh được upload
      imageUrl = `/uploads/messages/${req.file.filename}`;
      messageType = content && content.trim() ? "image_with_text" : "image";
    } else if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Nội dung tin nhắn không được để trống" });
    }

    const messageData = {
      sender_id,
      receiver_id,
      content: content || "",
      image_url: imageUrl,
      message_type: messageType,
    };

    const message = await Message.create(messageData);
    res.status(201).json({ message: "Gửi thành công", data: message });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Middleware để upload ảnh
exports.uploadImage = upload.single("image");

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const withUser = parseInt(req.query.withUser, 10);

    if (!withUser) {
      return res.status(400).json({ message: "Thiếu user cần lấy tin nhắn" });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: withUser },
          { sender_id: withUser, receiver_id: userId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("Lỗi lấy tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getLikedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    // Lấy những người bạn đã like (status: pending hoặc matched)
    const matches = await Match.findAll({
      where: {
        user1_id: userId,
        status: ["pending", "matched"],
      },
    });
    const userIds = matches.map((m) => m.user2_id);
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "profile_picture"],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.deleteLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = parseInt(req.params.id, 10); // id của người bị xóa khỏi danh sách

    // Xóa bản ghi like (user1_id là bạn, user2_id là người kia)
    const deleted = await Match.destroy({
      where: {
        user1_id: userId,
        user2_id: targetId,
        status: ["pending", "matched"],
      },
    });

    if (deleted) {
      res.json({ message: "Đã xóa like thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy like để xóa" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getUsersLikedYou = async (req, res) => {
  try {
    const userId = req.user.id;
    // Những người đã like bạn nhưng bạn chưa like lại
    const likes = await Match.findAll({
      where: {
        user2_id: userId,
        status: "pending",
      },
    });

    // Lấy danh sách user IDs của những người đã like
    const userIds = likes.map((like) => like.user1_id);

    // Lấy thông tin users
    const users = await User.findAll({
      where: { id: userIds },
      attributes: [
        "id",
        "name",
        "profile_picture",
        "age",
        "bio",
        "gender",
        "height",
        "weight",
        "job",
        "hobbies",
        "birthday"
      ],
    });

    // Tạo map để truy cập nhanh user info
    const userMap = new Map();
    users.forEach((user) => userMap.set(user.id, user));

    // Tạo kết quả với thông tin user
    const result = likes.map((like) => ({
      id: like.id,
      user1_id: like.user1_id,
      user2_id: like.user2_id,
      status: like.status,
      createdAt: like.createdAt,
      updatedAt: like.updatedAt,
      Swiper: userMap.get(like.user1_id),
    }));

    res.json(result);
  } catch (error) {
    console.error("Error in getUsersLikedYou:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getMatchedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const matches = await Match.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        status: "matched",
        is_deleted: 0,
      },
      include: [
        {
          model: User,
          as: "User1",
          attributes: ["id", "name", "profile_picture", "age", "bio"],
        },
        {
          model: User,
          as: "User2",
          attributes: ["id", "name", "profile_picture", "age", "bio"],
        },
      ],
    });

    // Lọc các bản ghi trùng lặp nếu có
    const uniqueMatchesMap = new Map();
    matches.forEach((match) => {
      const otherUserId =
        match.user1_id === userId ? match.user2_id : match.user1_id;
      if (!uniqueMatchesMap.has(otherUserId)) {
        uniqueMatchesMap.set(otherUserId, match);
      }
    });
    const uniqueMatches = Array.from(uniqueMatchesMap.values());

    // Lấy tin nhắn cuối cùng và đếm tin nhắn chưa đọc cho từng match
    const Message = require("../models/Message");
    const result = await Promise.all(
      uniqueMatches.map(async (match) => {
        const otherUser = match.User1.id === userId ? match.User2 : match.User1;

        // Lấy tin nhắn cuối cùng giữa userId và otherUser.id
        const lastMsg = await Message.findOne({
          where: {
            [Op.or]: [
              { sender_id: userId, receiver_id: otherUser.id },
              { sender_id: otherUser.id, receiver_id: userId },
            ],
          },
          order: [["createdAt", "DESC"]],
        });

        // Đếm tin nhắn chưa đọc từ otherUser gửi cho userId
        const unreadCount = await Message.count({
          where: {
            sender_id: otherUser.id,
            receiver_id: userId,
            is_read: false,
          },
        });

        // Tạo nội dung hiển thị cho tin nhắn cuối cùng
        let lastMessageDisplay = "";
        if (lastMsg) {
          if (lastMsg.message_type === "image") {
            lastMessageDisplay = "📷 Ảnh";
          } else if (lastMsg.message_type === "image_with_text") {
            lastMessageDisplay = `📷 ${lastMsg.content}`;
          } else {
            lastMessageDisplay = lastMsg.content;
          }
        }

        return {
          user: otherUser,
          lastMessage: lastMessageDisplay,
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          unread_count: unreadCount,
          online: false, // Nếu có logic online thì thay đổi ở đây
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error getting matched users:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa match (chuyển is_deleted thành true)
exports.deleteMatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = parseInt(req.params.id, 10);
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { user1_id: userId, user2_id: targetId },
          { user1_id: targetId, user2_id: userId },
        ],
        status: "matched",
        is_deleted: 0,
      },
    });
    if (!match)
      return res.status(404).json({ message: "Không tìm thấy match" });
    match.is_deleted = 1;
    await match.save();
    await match.reload(); // Đảm bảo ORM flush cache và DB đã commit

    // Lấy lại danh sách matched-users mới nhất
    const matches = await Match.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        status: "matched",
        is_deleted: 0,
      },
      include: [
        {
          model: User,
          as: "User1",
          attributes: ["id", "name", "profile_picture", "age", "bio"],
        },
        {
          model: User,
          as: "User2",
          attributes: ["id", "name", "profile_picture", "age", "bio"],
        },
      ],
    });

    // Lọc các bản ghi trùng lặp nếu có
    const uniqueMatchesMap = new Map();
    matches.forEach((match) => {
      const otherUserId =
        match.user1_id === userId ? match.user2_id : match.user1_id;
      if (!uniqueMatchesMap.has(otherUserId)) {
        uniqueMatchesMap.set(otherUserId, match);
      }
    });
    const uniqueMatches = Array.from(uniqueMatchesMap.values());

    // Lấy tin nhắn cuối cùng cho từng match
    const Message = require("../models/Message");
    const result = await Promise.all(
      uniqueMatches.map(async (match) => {
        const otherUser = match.User1.id === userId ? match.User2 : match.User1;
        const lastMsg = await Message.findOne({
          where: {
            [Op.or]: [
              { sender_id: userId, receiver_id: otherUser.id },
              { sender_id: otherUser.id, receiver_id: userId },
            ],
          },
          order: [["createdAt", "DESC"]],
        });

        // Tạo nội dung hiển thị cho tin nhắn cuối cùng
        let lastMessageDisplay = "";
        if (lastMsg) {
          if (lastMsg.message_type === "image") {
            lastMessageDisplay = "📷 Ảnh";
          } else if (lastMsg.message_type === "image_with_text") {
            lastMessageDisplay = `📷 ${lastMsg.content}`;
          } else {
            lastMessageDisplay = lastMsg.content;
          }
        }

        return {
          user: otherUser,
          lastMessage: lastMessageDisplay,
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          online: false,
        };
      })
    );

    res.json({ message: "Đã xóa khỏi danh sách chat", matchedUsers: result });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.getDeletedMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const matches = await Match.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        status: "matched",
        is_deleted: 1,
      },
    });
    const userIds = matches.map((m) =>
      m.user1_id === userId ? m.user2_id : m.user1_id
    );
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "profile_picture", "age", "bio"],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.restoreMatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = parseInt(req.params.id, 10);
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { user1_id: userId, user2_id: targetId },
          { user1_id: targetId, user2_id: userId },
        ],
        status: "matched",
        is_deleted: 1,
      },
    });
    if (!match)
      return res.status(404).json({ message: "Không tìm thấy match đã xóa" });
    match.is_deleted = 0;
    await match.save();
    res.json({ message: "Khôi phục thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đánh dấu tin nhắn đã đọc
exports.markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const senderId = parseInt(req.params.senderId, 10);

    // Đánh dấu tất cả tin nhắn từ senderId gửi cho userId là đã đọc
    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: senderId,
          receiver_id: userId,
          is_read: false,
        },
      }
    );

    res.json({ message: "Đã đánh dấu tin nhắn đã đọc" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
