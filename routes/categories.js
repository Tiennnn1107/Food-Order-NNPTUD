var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/categories');
let { checkLogin, checkRole } = require('../utils/authHandler');

// GET /categories - tat ca moi nguoi xem duoc
router.get('/', async function (req, res, next) {
    let categories = await categoryModel.find({ isDeleted: false });
    res.send(categories);
});

// GET /categories/:id
router.get('/:id', async function (req, res, next) {
    try {
        let result = await categoryModel.findOne({ _id: req.params.id, isDeleted: false });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// POST /categories - chi ADMIN
router.post('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        let newItem = new categoryModel({
            name: req.body.name,
            description: req.body.description,
            imageUrl: req.body.imageUrl
        });
        await newItem.save();
        res.send(newItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /categories/:id - chi ADMIN
router.put('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        let updatedItem = await categoryModel.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /categories/:id - soft delete, chi ADMIN
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        let updatedItem = await categoryModel.findByIdAndUpdate(
            req.params.id, { isDeleted: true }, { new: true }
        );
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
