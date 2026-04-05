var express = require('express');
var router = express.Router();
let { userPostValidation, validateResult } = require('../utils/validationHandler');
let { checkLogin, checkRole } = require('../utils/authHandler');
let userModel = require('../schemas/users');
let cartModel = require('../schemas/cart');
let userController = require('../controllers/users');

// GET /users - lay tat ca user (chi ADMIN)
router.get('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    let result = await userController.getAllUser();
    res.send(result);
});

// GET /users/:id (ADMIN hoac MODERATOR)
router.get('/:id', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let result = await userController.FindByID(req.params.id);
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// POST /users - tao user moi (chi ADMIN)
router.post('/', checkLogin, checkRole('ADMIN'), userPostValidation, validateResult, async function (req, res, next) {
    try {
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            role: req.body.role,
            fullName: req.body.fullName || "",
            phone: req.body.phone || "",
            avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
            status: false
        });
        await newUser.save();
        let newCart = new cartModel({ user: newUser._id });
        await newCart.save();
        res.send(newUser);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /users/:id - cap nhat user
router.put('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        let updatedItem = await userModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        let keys = Object.keys(req.body);
        for (const key of keys) {
            updatedItem[key] = req.body[key];
        }
        await updatedItem.save();
        let populated = await userModel.findById(updatedItem._id).populate({ path: 'role', select: 'name' });
        res.send(populated);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /users/:id - soft delete (chi ADMIN)
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        let updatedItem = await userModel.findByIdAndUpdate(
            req.params.id, { isDeleted: true }, { new: true }
        );
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
