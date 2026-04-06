var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');
let { checkLogin } = require('../utils/authHandler');
let roleModel = require('../schemas/roles');
let cartModel = require('../schemas/cart');
let userModel = require('../schemas/users');

// POST /auth/register
router.post('/register', async function (req, res, next) {
    try {
        let roleName = req.body.role || 'CUSTOMER'; // Neu khong chon thi mac dinh la CUSTOMER
        let targetRole = await roleModel.findOne({ name: roleName });

        if (!targetRole) {
            return res.status(400).send({ message: "Role khong ton tai" });
        }

        let checkEmail = await userModel.findOne({ email: req.body.email });
        if (checkEmail) {
            return res.status(400).send({ message: "Email nay da duoc su dung" });
        }

        // Khong hash thu cong, de schema hook tu hash
        let newUser = new userModel({
            username: req.body.username || req.body.email.split('@')[0],
            password: req.body.password, // Schema se tu hash
            email: req.body.email,
            role: targetRole._id,
            fullName: req.body.fullName || "",
            phone: req.body.phone || "",
            status: true
        });

        await newUser.save();
        let newCart = new cartModel({ user: newUser._id });
        await newCart.save();

        res.send({ message: "dang ky thanh cong", user: newUser });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// Logic Login giu nguyen (da sua truoc do)
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let getUser = await userModel.findOne({ 
            $or: [{ email: username }, { username: username }] 
        }).populate('role');

        if (!getUser) {
            return res.status(401).send({ message: "Email/Username khong ton tai" });
        }
        
        let result = bcrypt.compareSync(password, getUser.password);
        if (result) {
            let token = jwt.sign(
                { id: getUser._id, role: getUser.role?.name },
                'FOOD_ORDER_SECRET',
                { expiresIn: '24h' }
            );
            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            res.send({ 
                token: token,
                user: {
                    id: getUser._id,
                    email: getUser.email,
                    fullName: getUser.fullName,
                    role: getUser.role?.name
                }
            });
        } else {
            res.status(401).send({ message: "Mat khau khong chinh xac" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /auth/logout
router.post('/logout', async function (req, res, next) {
    res.clearCookie('token');
    res.send({ message: "Dang xuat thanh cong" });
});

// GET /auth/me
router.get('/me', checkLogin, async function (req, res, next) {
    try {
        let user = await userModel.findById(req.userId).populate('role');
        res.send(user);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// PUT /auth/profile - cap nhat thong tin ca nhan
router.put('/profile', checkLogin, async function (req, res, next) {
    try {
        let user = await userModel.findById(req.userId);
        if (!user) return res.status(404).send({ message: "User khong ton tai" });

        if (req.body.fullName) user.fullName = req.body.fullName;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.email) {
            // Kiem tra email co trung voi user khac khong
            let checkEmail = await userModel.findOne({ email: req.body.email, _id: { $ne: req.userId } });
            if (checkEmail) return res.status(400).send({ message: "Email nay da duoc su dung" });
            user.email = req.body.email;
        }

        await user.save();
        let populated = await userModel.findById(user._id).populate('role');
        res.send(populated);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /auth/change-password - doi mat khau
router.put('/change-password', checkLogin, async function (req, res, next) {
    try {
        let { currentPassword, newPassword } = req.body;
        let user = await userModel.findById(req.userId);

        let isMatch = bcrypt.compareSync(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Mat khau hien tai khong dung" });
        }

        user.password = newPassword; // Schema hook se tu hash
        await user.save();
        res.send({ message: "Doi mat khau thanh cong" });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// POST /auth/forgot-password - gui yeu cau khoi phuc mat khau
router.post('/forgot-password', async function (req, res, next) {
    try {
        let { email } = req.body;
        console.log('Forgot password request for:', email);

        if (!email) {
            return res.status(400).send({ message: "Email la bat buoc" });
        }

        let user = await userModel.findOne({ email: email.toLowerCase(), isDeleted: false });
        console.log('User found:', user ? user.email : 'none');

        if (!user) {
            // Tra ve success de tranh bi liet ke email
            return res.send({ message: "Neu email ton tai, chung toi da gui huong dan khoi phuc mat khau" });
        }

        // Tao token reset password
        let resetToken = crypto.randomBytes(32).toString('hex');
        console.log('Generated reset token:', resetToken);

        // Luu token vao database
        let hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        console.log('Hashed token to save:', hashedToken);

        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordTokenExp = new Date(Date.now() + 30 * 60 * 1000); // 30 phut
        await user.save();

        console.log('Saved to DB - token:', user.forgotPasswordToken, 'exp:', user.forgotPasswordTokenExp);

        // TODO: Goi API gui email (hien tai chi tra ve token de test)
        // Trong thuc te, su dung nodemailer hoac dich vu email de gui

        res.send({
            message: "Neu email ton tai, chung toi da gui huong dan khoi phuc mat khau",
            resetToken: resetToken // Remove trong production
        });
    } catch (err) {
        console.error('Forgot password error:', err.message);
        res.status(400).send({ message: err.message });
    }
});

// POST /auth/reset-password - dat lai mat khau
router.post('/reset-password', async function (req, res, next) {
    try {
        let { token, newPassword } = req.body;
        console.log('Reset password request:', { token: token?.substring(0, 10) + '...', newPassword: newPassword ? '***' : undefined });

        if (!token || !newPassword) {
            console.log('Missing token or newPassword');
            return res.status(400).send({ message: "Token va mat khau moi la bat buoc" });
        }

        // Hash token de so sanh voi database
        let hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log('Hashed token:', hashedToken);

        let user = await userModel.findOne({
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExp: { $gt: Date.now() },
            isDeleted: false
        });

        console.log('User found:', user ? user.email : 'none');

        if (!user) {
            return res.status(400).send({ message: "Token khong hop le hoac da het han" });
        }

        // Dat lai mat khau
        user.password = newPassword;
        user.forgotPasswordToken = '';
        user.forgotPasswordTokenExp = undefined;
        await user.save();

        res.send({ message: "Dat lai mat khau thanh cong" });
    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
