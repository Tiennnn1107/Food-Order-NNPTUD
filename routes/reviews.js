var express = require('express');
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler');
let reviewModel = require('../schemas/reviews');
let orderModel = require('../schemas/orders');
let { uploadImage } = require('../utils/uploadHandler');

// GET /reviews - xem tat ca review (co the loc theo food)
router.get('/', async function (req, res, next) {
    let filter = { isDeleted: false };
    if (req.query.food) {
        filter.food = req.query.food;
    }
    let reviews = await reviewModel.find(filter)
        .populate('user', 'username avatarUrl')
        .populate('food', 'name imageUrl')
        .sort({ createdAt: -1 });
    res.send(reviews);
});

// GET /reviews/:id
router.get('/:id', async function (req, res, next) {
    try {
        let result = await reviewModel.findOne({ _id: req.params.id, isDeleted: false })
            .populate('user', 'username avatarUrl')
            .populate('food', 'name');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// POST /reviews - CUSTOMER tao review sau khi da delivered
router.post('/', checkLogin, uploadImage.single('file'), async function (req, res, next) {
    try {
        // Kiem tra order da delivered chua
        let order = await orderModel.findOne({
            _id: req.body.order,
            user: req.userId,
            status: 'delivered',
            isDeleted: false
        });
        if (!order) {
            return res.status(400).send({ message: "ban chi co the danh gia sau khi don hang da giao thanh cong" });
        }
        // Kiem tra da review chua
        let existReview = await reviewModel.findOne({
            user: req.userId,
            food: req.body.food,
            order: req.body.order,
            isDeleted: false
        });
        if (existReview) {
            return res.status(400).send({ message: "ban da danh gia mon an nay roi" });
        }
        let newReview = new reviewModel({
            user: req.userId,
            food: req.body.food,
            order: req.body.order,
            rating: req.body.rating,
            comment: req.body.comment || "",
            imageUrl: req.file ? req.file.path : ""
        });
        await newReview.save();
        await newReview.populate('user', 'username avatarUrl');
        await newReview.populate('food', 'name');
        res.send(newReview);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /reviews/:id - chi chinh sua review cua minh
router.put('/:id', checkLogin, async function (req, res, next) {
    try {
        let review = await reviewModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!review) return res.status(404).send({ message: "id not found" });
        if (review.user.toString() !== req.userId) {
            return res.status(403).send({ message: "ban khong co quyen sua review nay" });
        }
        if (req.body.rating) review.rating = req.body.rating;
        if (req.body.comment !== undefined) review.comment = req.body.comment;
        await review.save();
        res.send(review);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /reviews/:id - soft delete: chu review hoac ADMIN
router.delete('/:id', checkLogin, async function (req, res, next) {
    try {
        let review = await reviewModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!review) return res.status(404).send({ message: "id not found" });
        let userController = require('../controllers/users');
        let user = await userController.FindByID(req.userId);
        if (review.user.toString() !== req.userId && user.role.name !== 'ADMIN') {
            return res.status(403).send({ message: "ban khong co quyen xoa review nay" });
        }
        review.isDeleted = true;
        await review.save();
        res.send(review);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
