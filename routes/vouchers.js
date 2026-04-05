var express = require('express');
var router = express.Router();
let { checkLogin, checkRole } = require('../utils/authHandler');
let voucherModel = require('../schemas/vouchers');

// GET /vouchers - ADMIN xem tat ca voucher
router.get('/', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    let vouchers = await voucherModel.find({ isDeleted: false })
        .sort({ createdAt: -1 });
    res.send(vouchers);
});

// GET /vouchers/:id - ADMIN xem chi tiet 1 voucher
router.get('/:id', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let result = await voucherModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!result) return res.status(404).send({ message: "id not found" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

// POST /vouchers/check - CUSTOMER kiem tra ma voucher hop le khong
router.post('/check', checkLogin, async function (req, res, next) {
    try {
        let { code, orderAmount } = req.body;
        let voucher = await voucherModel.findOne({
            code: code.toUpperCase(),
            isActive: true,
            isDeleted: false
        });

        if (!voucher) {
            return res.status(404).send({ message: "ma voucher khong ton tai hoac da bi vo hieu hoa" });
        }

        // Kiem tra con han su dung khong
        let now = new Date();
        if (now < voucher.startDate) {
            return res.status(400).send({ message: "voucher chua den thoi gian su dung" });
        }
        if (now > voucher.endDate) {
            return res.status(400).send({ message: "voucher da het han" });
        }

        // Kiem tra con luot dung khong
        if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).send({ message: "voucher da het luot su dung" });
        }

        // Kiem tra gia tri don hang toi thieu
        if (orderAmount < voucher.minOrderAmount) {
            return res.status(400).send({
                message: `don hang toi thieu ${voucher.minOrderAmount} de dung voucher nay`
            });
        }

        // Tinh toan so tien duoc giam
        let discountAmount = 0;
        if (voucher.discountType === 'percent') {
            discountAmount = (orderAmount * voucher.discountValue) / 100;
            // Neu co gioi han so tien giam toi da
            if (voucher.maxDiscount !== null && discountAmount > voucher.maxDiscount) {
                discountAmount = voucher.maxDiscount;
            }
        } else {
            // fixed
            discountAmount = voucher.discountValue;
        }

        // So tien giam khong duoc lon hon gia tri don hang
        if (discountAmount > orderAmount) discountAmount = orderAmount;

        res.send({
            voucher: voucher,
            discountAmount: discountAmount,
            finalAmount: orderAmount - discountAmount
        });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// POST /vouchers - ADMIN tao voucher moi
router.post('/', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let newVoucher = new voucherModel({
            code: req.body.code,
            description: req.body.description,
            discountType: req.body.discountType,
            discountValue: req.body.discountValue,
            minOrderAmount: req.body.minOrderAmount || 0,
            maxDiscount: req.body.maxDiscount || null,
            usageLimit: req.body.usageLimit || null,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });
        await newVoucher.save();
        res.send(newVoucher);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /vouchers/:id - ADMIN cap nhat voucher
router.put('/:id', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let updatedVoucher = await voucherModel.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );
        if (!updatedVoucher) return res.status(404).send({ message: "id not found" });
        res.send(updatedVoucher);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /vouchers/:id/toggle - ADMIN bat/tat voucher
router.put('/:id/toggle', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let voucher = await voucherModel.findOne({ _id: req.params.id, isDeleted: false });
        if (!voucher) return res.status(404).send({ message: "id not found" });
        voucher.isActive = !voucher.isActive;
        await voucher.save();
        res.send({
            message: voucher.isActive ? "da kich hoat voucher" : "da vo hieu hoa voucher",
            voucher
        });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /vouchers/:id - soft delete, chi ADMIN
router.delete('/:id', checkLogin, checkRole('ADMIN', 'MODERATOR'), async function (req, res, next) {
    try {
        let updatedVoucher = await voucherModel.findByIdAndUpdate(
            req.params.id, { isDeleted: true }, { new: true }
        );
        if (!updatedVoucher) return res.status(404).send({ message: "id not found" });
        res.send(updatedVoucher);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
