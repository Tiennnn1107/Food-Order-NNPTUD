var express = require('express');
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler');
let addressModel = require('../schemas/addresses');

// GET /addresses - lay tat ca dia chi cua minh
router.get('/', checkLogin, async function (req, res, next) {
    let addresses = await addressModel.find({ user: req.userId, isDeleted: false })
        .sort({ isDefault: -1, createdAt: -1 });
    res.send(addresses);
});

// GET /addresses/:id - xem 1 dia chi
router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        let result = await addressModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!result) return res.status(404).send({ message: "id not found" });
        if (result.user.toString() !== req.userId) {
            return res.status(403).send({ message: "ban khong co quyen xem dia chi nay" });
        }
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// POST /addresses - tao dia chi moi
router.post('/', checkLogin, async function (req, res, next) {
    try {
        // Neu isDefault = true thi bo default cac dia chi khac
        if (req.body.isDefault) {
            await addressModel.updateMany(
                { user: req.userId, isDeleted: false },
                { isDefault: false }
            );
        }
        // Neu day la dia chi dau tien thi tu dong set default
        let count = await addressModel.countDocuments({ user: req.userId, isDeleted: false });
        let newAddress = new addressModel({
            user: req.userId,
            fullName: req.body.fullName,
            phone: req.body.phone,
            street: req.body.street,
            ward: req.body.ward || "",
            district: req.body.district,
            city: req.body.city,
            isDefault: count === 0 ? true : (req.body.isDefault || false)
        });
        await newAddress.save();
        res.send(newAddress);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /addresses/:id - cap nhat dia chi
router.put('/:id', checkLogin, async function (req, res, next) {
    try {
        let address = await addressModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!address) return res.status(404).send({ message: "id not found" });
        if (address.user.toString() !== req.userId) {
            return res.status(403).send({ message: "ban khong co quyen sua dia chi nay" });
        }
        // Neu set isDefault = true thi bo default cac dia chi khac
        if (req.body.isDefault) {
            await addressModel.updateMany(
                { user: req.userId, isDeleted: false },
                { isDefault: false }
            );
        }
        let keys = Object.keys(req.body);
        for (const key of keys) {
            address[key] = req.body[key];
        }
        await address.save();
        res.send(address);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /addresses/:id/set-default - dat lam dia chi mac dinh
router.put('/:id/set-default', checkLogin, async function (req, res, next) {
    try {
        let address = await addressModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!address) return res.status(404).send({ message: "id not found" });
        if (address.user.toString() !== req.userId) {
            return res.status(403).send({ message: "ban khong co quyen thay doi dia chi nay" });
        }
        // Bo default tat ca dia chi cu
        await addressModel.updateMany(
            { user: req.userId, isDeleted: false },
            { isDefault: false }
        );
        // Set dia chi nay la default
        address.isDefault = true;
        await address.save();
        res.send(address);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /addresses/:id - soft delete
router.delete('/:id', checkLogin, async function (req, res, next) {
    try {
        let address = await addressModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!address) return res.status(404).send({ message: "id not found" });
        if (address.user.toString() !== req.userId) {
            return res.status(403).send({ message: "ban khong co quyen xoa dia chi nay" });
        }
        address.isDeleted = true;
        await address.save();
        // Neu xoa dia chi default thi set dia chi dau tien con lai lam default
        if (address.isDefault) {
            let nextAddress = await addressModel.findOne({ user: req.userId, isDeleted: false });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }
        res.send(address);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
