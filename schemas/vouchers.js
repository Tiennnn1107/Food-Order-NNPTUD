const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true  // tu dong chuyen thanh chu hoa: "sale10" → "SALE10"
        },
        description: {
            type: String,
            default: ""
        },
        discountType: {
            type: String,
            enum: ['percent', 'fixed'],  // percent = %, fixed = so tien co dinh
            required: true
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },
        minOrderAmount: {
            type: Number,
            default: 0  // don hang toi thieu de dung voucher
        },
        maxDiscount: {
            type: Number,
            default: null  // giam toi da bao nhieu (null = khong gioi han)
        },
        usageLimit: {
            type: Number,
            default: null  // tong so lan duoc dung (null = khong gioi han)
        },
        usedCount: {
            type: Number,
            default: 0  // so lan da duoc dung
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('voucher', voucherSchema);
