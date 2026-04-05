var express = require('express');
var router = express.Router();
let foodModel = require('../schemas/foods');
let { checkLogin, checkRole } = require('../utils/authHandler');
let { foodPostValidation, validateResult } = require('../utils/validationHandler');
let { ConvertToSlug } = require('../utils/slugHandler');
let { uploadImage } = require('../utils/uploadHandler');

// GET /foods - tat ca moi nguoi xem duoc, co the loc theo category
router.get('/', async function (req, res, next) {
    let filter = { isDeleted: false };
    if (req.query.category) {
        filter.category = req.query.category;
    }
    if (req.query.name) {
        filter.name = { $regex: req.query.name, $options: 'i' };
    }
    let foods = await foodModel.find(filter).populate('category', 'name');
    res.send(foods);
});

// GET /foods/:id
router.get('/:id', async function (req, res, next) {
    try {
        let result = await foodModel.findOne({ _id: req.params.id, isDeleted: false })
            .populate('category', 'name');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// POST /foods - chi ADMIN tao mon an moi
router.post('/', checkLogin, checkRole('ADMIN'), foodPostValidation, validateResult, async function (req, res, next) {
    try {
        let newItem = new foodModel({
            name: req.body.name,
            slug: ConvertToSlug(req.body.name),
            description: req.body.description,
            price: req.body.price,
            imageUrl: req.body.imageUrl || "",
            category: req.body.category,
            isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true
        });
        await newItem.save();
        await newItem.populate('category', 'name');
        res.send(newItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// POST /foods/:id/upload-image - upload anh mon an
router.post('/:id/upload-image', checkLogin, checkRole('ADMIN'), uploadImage.single('file'), async function (req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "khong co file duoc upload" });
        }
        let updatedItem = await foodModel.findByIdAndUpdate(
            req.params.id,
            { imageUrl: req.file.path },
            { new: true }
        );
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /foods/:id - chi ADMIN
router.put('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        if (req.body.name) {
            req.body.slug = ConvertToSlug(req.body.name);
        }
        let updatedItem = await foodModel.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        ).populate('category', 'name');
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /foods/:id - soft delete, chi ADMIN
router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
    try {
        let updatedItem = await foodModel.findByIdAndUpdate(
            req.params.id, { isDeleted: true }, { new: true }
        );
        if (!updatedItem) return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
