var express = require('express');
var router = express.Router();
let { checkLogin } = require('../utils/authHandler');
let cartModel = require('../schemas/cart');
let foodModel = require('../schemas/foods');

// GET /cart - xem gio hang cua minh
router.get('/', checkLogin, async function (req, res, next) {
    let cart = await cartModel.findOne({ user: req.userId })
        .populate('cartItems.food', 'name price imageUrl');
    if (!cart) {
        return res.status(404).send({ message: "gio hang khong ton tai" });
    }
    res.send(cart);
});

// POST /cart/add - them mon vao gio hang
router.post('/add', checkLogin, async function (req, res, next) {
    let foodId = req.body.foodId || req.body.food;
    let { quantity, note } = req.body;
    
    let getFood = await foodModel.findOne({ _id: foodId, isDeleted: false, isAvailable: true });
    if (!getFood) {
        return res.status(404).send({ message: "mon an khong ton tai hoac da het hang" });
    }
    let cart = await cartModel.findOne({ user: req.userId });
    if (!cart) {
        return res.status(404).send({ message: "gio hang khong ton tai" });
    }
    let existItem = cart.cartItems.find(e => e.food.toString() === foodId);
    if (existItem) {
        existItem.quantity += (quantity || 1);
        if (note !== undefined) existItem.note = note;
    } else {
        cart.cartItems.push({ food: foodId, quantity: quantity || 1, note: note || "" });
    }
    await cart.save();
    await cart.populate('cartItems.food', 'name price imageUrl');
    res.send(cart);
});

// POST /cart/reduce - giam so luong 1 mon
router.post('/reduce', checkLogin, async function (req, res, next) {
    let foodId = req.body.foodId || req.body.food;
    let cart = await cartModel.findOne({ user: req.userId });
    if (!cart) return res.status(404).send({ message: "gio hang khong ton tai" });
    let index = cart.cartItems.findIndex(e => e.food.toString() === foodId);
    if (index >= 0) {
        cart.cartItems[index].quantity -= 1;
        if (cart.cartItems[index].quantity <= 0) {
            cart.cartItems.splice(index, 1);
        }
    }
    await cart.save();
    await cart.populate('cartItems.food', 'name price imageUrl');
    res.send(cart);
});

// POST /cart/remove - xoa 1 mon khoi gio hang
router.post('/remove', checkLogin, async function (req, res, next) {
    let foodId = req.body.foodId || req.body.food;
    let cart = await cartModel.findOne({ user: req.userId });
    if (!cart) return res.status(404).send({ message: "gio hang khong ton tai" });
    let index = cart.cartItems.findIndex(e => e.food.toString() === foodId);
    if (index >= 0) {
        cart.cartItems.splice(index, 1);
    }
    await cart.save();
    await cart.populate('cartItems.food', 'name price imageUrl');
    res.send(cart);
});

// POST /cart/clear - xoa toan bo gio hang
router.post('/clear', checkLogin, async function (req, res, next) {
    let cart = await cartModel.findOne({ user: req.userId });
    if (!cart) return res.status(404).send({ message: "gio hang khong ton tai" });
    cart.cartItems = [];
    await cart.save();
    res.send({ message: "da xoa toan bo gio hang", cart });
});

module.exports = router;
