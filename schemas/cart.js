const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema(
    {
        food: {
            type: mongoose.Types.ObjectId,
            ref: 'food',
            required: true
        },
        quantity: {
            type: Number,
            min: 1,
            default: 1
        },
        note: {
            type: String,
            default: ""
        }
    },
    { _id: false }
);

const cartSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true,
            unique: true
        },
        cartItems: {
            type: [cartItemSchema],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('cart', cartSchema);
