const { User, Sequelize } = require('../models');
const { Op } = Sequelize;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const { generateToken } = require('../utils/authUtils');

// Đăng ký người dùng mới
exports.register = async (req, res) => {
  console.log('--- Bắt đầu register ---');
  try {
    const { username, password, fullname, gender, SDT, email } = req.body;

    if (!username || !password || !fullname || !gender || !SDT) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra SDT đã tồn tại chưa
    const existingSDT = await User.findOne({ where: { SDT: SDT } });
    if (existingSDT) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng.' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await User.create({
      username,
      password: hashedPassword,
      name: fullname,
      gender,
      SDT: SDT,
      email // Lưu email placeholder
    });

    console.log('Đăng ký thành công');
    res.status(201).json({ message: 'Đăng ký thành công. Vui lòng đăng nhập.' });
  } catch (error) {
    console.error('🔥 Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Tìm user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'Tên đăng nhập không tồn tại' });
    }
    
    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }
    
    // Tạo JWT token
    const token = generateToken(user);
    
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(400).json({ message: 'Vui lòng nhập email hoặc số điện thoại.' });
        }

        // 1) Lấy người dùng dựa trên email hoặc SDT
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { SDT: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(200).json({ message: 'Nếu thông tin của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết để khôi phục mật khẩu.' });
        }

        // 2) Tạo token reset
        const resetSecret = process.env.JWT_SECRET + user.password;
        const resetToken = jwt.sign({ id: user.id }, resetSecret, { expiresIn: '10m' });

        // 3) Tạo URL reset
        const resetURL = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}&id=${user.id}`;

        const message = `Bạn nhận được email này vì bạn đã yêu cầu đặt lại mật khẩu...\n\nNhấn vào liên kết sau để tiếp tục: ${resetURL}\n\nLiên kết sẽ hết hạn sau 10 phút.`;

        // 4) Gửi email
        await sendEmail({
            email: user.email,
            subject: 'Yêu cầu khôi phục mật khẩu (hiệu lực 10 phút)',
            message
        });

        res.status(200).json({ message: 'Liên kết khôi phục mật khẩu đã được gửi đến email của bạn.' });

    } catch (error) {
        console.error('LỖI QUÊN MẬT KHẨU:', error);
        return res.status(200).json({ message: 'Nếu thông tin của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết để khôi phục mật khẩu.' });
    }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(400).json({ message: 'Người dùng không tồn tại.' });
        }

        // 2) Xác thực token
        const resetSecret = process.env.JWT_SECRET + user.password;
        jwt.verify(token, resetSecret, async (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
            }

            // 3) Nếu token hợp lệ, cập nhật mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công.' });
        });

    } catch (error) {
        console.error('LỖI RESET MẬT KHẨU:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại.' });
  }
};