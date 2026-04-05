const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema(
    {
        food: {
            type: mongoose.Types.ObjectId,
            ref: 'food',
            required: true
        },
        foodName: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            min: 1,
            default: 1
        },
        subtotal: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true
        },
        items: {
            type: [orderItemSchema],
            default: []
        },
        totalAmount: {
            type: Number,
            default: 0
        },
        deliveryAddress: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        note: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled'],
            default: 'pending'
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('order', orderSchema);
