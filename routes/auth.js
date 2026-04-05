var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let { checkLogin } = require('../utils/authHandler');
let crypto = require('crypto');
let roleModel = require('../schemas/roles');
let cartModel = require('../schemas/cart');
let userModel = require('../schemas/users');

// POST /auth/register
router.post('/register', async function (req, res, next) {
    try {
        let defaultRole = await roleModel.findOne({ name: 'CUSTOMER', isDeleted: false });
        if (!defaultRole) {
            return res.status(400).send({ message: "Role CUSTOMER chua duoc tao" });
        }
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            role: defaultRole._id,
            fullName: req.body.fullName || "",
            phone: req.body.phone || "",
            status: false
        });
        await newUser.save();
        let newCart = new cartModel({ user: newUser._id });
        await newCart.save();
        res.send({ message: "dang ky thanh cong", user: newUser });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// POST /auth/login
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let getUser = await userController.FindByUsername(username);
        if (!getUser) {
            return res.status(404).send({ message: "username hoac password khong dung" });
        }
        let result = bcrypt.compareSync(password, getUser.password);
        if (result) {
            let token = jwt.sign(
                { id: getUser._id, exp: Date.now() + 3600 * 1000 },
                'FOOD_ORDER_SECRET'
            );
            res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
            res.send({ token: token });
        } else {
            res.status(404).send({ message: "username hoac password khong dung" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET /auth/me
router.get('/me', checkLogin, async function (req, res, next) {
    try {
        let user = await userController.FindByID(req.userId);
        res.send(user);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /auth/logout
router.post('/logout', checkLogin, function (req, res, next) {
    res.cookie('token', null, { maxAge: 0, httpOnly: true });
    res.send({ message: "dang xuat thanh cong" });
});

// POST /auth/changepassword
router.post('/changepassword', checkLogin, async function (req, res, next) {
    try {
        let { oldPassword, newPassword } = req.body;
        let rawUser = await userModel.findById(req.userId);
        if (!rawUser) {
            return res.status(404).send({ message: "user khong ton tai" });
        }
        if (!bcrypt.compareSync(oldPassword, rawUser.password)) {
            return res.status(400).send({ message: "mat khau cu khong dung" });
        }
        rawUser.password = newPassword;
        await rawUser.save();
        res.send({ message: "doi mat khau thanh cong" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /auth/forgotpassword
router.post('/forgotpassword', async function (req, res, next) {
    try {
        let email = req.body.email;
        let user = await userController.FindByEmail(email);
        if (user) {
            user.forgotPasswordToken = crypto.randomBytes(31).toString('hex');
            user.forgotPasswordTokenExp = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            res.send({ message: "da gui email reset password, kiem tra hop thu" });
            return;
        }
        res.status(404).send({ message: "email khong ton tai" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /auth/resetpassword/:token
router.post('/resetpassword/:token', async function (req, res, next) {
    try {
        let token = req.params.token;
        let newPassword = req.body.password;
        let getUser = await userController.FindByToken(token);
        if (getUser) {
            getUser.password = newPassword;
            getUser.forgotPasswordToken = '';
            getUser.forgotPasswordTokenExp = null;
            await getUser.save();
            res.send({ message: "cap nhat mat khau thanh cong" });
        } else {
            res.status(400).send({ message: "token khong hop le hoac da het han" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
