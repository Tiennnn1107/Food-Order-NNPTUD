const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true
        },
        food: {
            type: mongoose.Types.ObjectId,
            ref: 'food',
            required: true
        },
        order: {
            type: mongoose.Types.ObjectId,
            ref: 'order',
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: {
            type: String,
            default: ""
        },
        imageUrl: {
            type: String,
            default: ""
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('review', reviewSchema);
