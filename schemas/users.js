const mongoose = require('mongoose');
let bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
        },
        fullName: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        avatarUrl: {
            type: String,
            default: "https://i.sstatic.net/l60Hf.png"
        },
        status: { type: Boolean, default: false },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'role',
            required: true
        },
        isDeleted: { type: Boolean, default: false },
        forgotPasswordToken: { type: String, default: "" },
        forgotPasswordTokenExp: { type: Date }
    },
    { timestamps: true }
);

// Chi hash khi password thay doi
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    let genSalt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, genSalt);
});

module.exports = mongoose.model('user', userSchema);
