var express = require('express');
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler');
let orderModel = require('../schemas/orders');
let cartModel = require('../schemas/cart');
let foodModel = require('../schemas/foods');

// GET /orders - ADMIN xem tat ca don, CUSTOMER xem don cua minh
router.get('/', checkLogin, async function (req, res, next) {
    let userController = require('../controllers/users');
    let user = await userController.FindByID(req.userId);
    let roleName = user.role.name;
    let filter = { isDeleted: false };
    if (roleName === 'CUSTOMER') {
        filter.user = req.userId;
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }
    let orders = await orderModel.find(filter)
        .populate('user', 'username fullName phone')
        .populate('items.food', 'name imageUrl')
        .sort({ createdAt: -1 });
    res.send(orders);
});

// GET /orders/:id
router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        let order = await orderModel.findOne({ _id: req.params.id, isDeleted: false })
            .populate('user', 'username fullName phone')
            .populate('items.food', 'name imageUrl');
        if (!order) return res.status(404).send({ message: "don hang khong ton tai" });
        // Customer chi xem duoc don cua minh
        let userController = require('../controllers/users');
        let user = await userController.FindByID(req.userId);
        if (user.role.name === 'CUSTOMER' && order.user._id.toString() !== req.userId) {
            return res.status(403).send({ message: "ban khong co quyen xem don hang nay" });
        }
        res.send(order);
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// POST /orders - dat hang tu gio hang
router.post('/', checkLogin, async function (req, res, next) {
    try {
        let cart = await cartModel.findOne({ user: req.userId })
            .populate('cartItems.food');
        if (!cart || cart.cartItems.length === 0) {
            return res.status(400).send({ message: "gio hang rong, vui long them mon truoc khi dat" });
        }
        let items = [];
        let totalAmount = 0;
        for (const item of cart.cartItems) {
            let food = item.food;
            if (!food || food.isDeleted || !food.isAvailable) {
                return res.status(400).send({ message: `Mon an ${food?.name || ''} khong con kha dung` });
            }
            let subtotal = food.price * item.quantity;
            totalAmount += subtotal;
            items.push({
                food: food._id,
                foodName: food.name,
                price: food.price,
                quantity: item.quantity,
                subtotal: subtotal
            });
        }
        let newOrder = new orderModel({
            user: req.userId,
            items: items,
            totalAmount: totalAmount,
            deliveryAddress: req.body.deliveryAddress,
            phone: req.body.phone,
            note: req.body.note || ""
        });
        await newOrder.save();
        // Xoa gio hang sau khi dat
        cart.cartItems = [];
        await cart.save();
        res.send(newOrder);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /orders/:id/status - ADMIN cap nhat trang thai don hang
router.put('/:id/status', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let validStatus = ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled'];
        if (!validStatus.includes(req.body.status)) {
            return res.status(400).send({ message: "status khong hop le" });
        }
        let updatedOrder = await orderModel.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('user', 'username fullName');
        if (!updatedOrder) return res.status(404).send({ message: "id not found" });
        res.send(updatedOrder);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// POST /orders/:id/cancel - CUSTOMER tu huy don khi con pending
router.post('/:id/cancel', checkLogin, async function (req, res, next) {
    try {
        let order = await orderModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!order) return res.status(404).send({ message: "don hang khong ton tai" });
        if (order.user.toString() !== req.userId) {
            return res.status(403).send({ message: "ban khong co quyen huy don hang nay" });
        }
        if (order.status !== 'pending') {
            return res.status(400).send({ message: "chi co the huy don khi con o trang thai cho xac nhan" });
        }
        order.status = 'cancelled';
        await order.save();
        res.send(order);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /orders/:id - soft delete, chi ADMIN hoac MODERATOR
router.delete('/:id', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let updatedItem = await orderModel.findByIdAndUpdate(
            req.params.id, { isDeleted: true }, { new: true }
        );
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
