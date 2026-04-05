let { body, validationResult } = require('express-validator');
let util = require('util');

let options = {
    password: {
        minLength: 8,
        minLowercase: 1,
        minSymbols: 1,
        minUppercase: 1,
        minNumbers: 1
    }
};

module.exports = {
    userPostValidation: [
        body('email').notEmpty().withMessage("email khong duoc de trong")
            .bail().isEmail().withMessage("khong phai dinh dang email"),
        body('password').notEmpty().withMessage("password khong duoc de trong")
            .bail().isStrongPassword(options.password)
            .withMessage(
                util.format(
                    "password phai co it nhat %d ki tu, trong do it nhat %d ki tu so",
                    options.password.minLength, options.password.minNumbers
                )
            ),
        body('username').notEmpty().withMessage("username khong duoc de trong")
    ],

    foodPostValidation: [
        body('name').notEmpty().withMessage("ten mon an khong duoc de trong"),
        body('price').notEmpty().withMessage("gia khong duoc de trong")
            .bail().isNumeric().withMessage("gia phai la so")
            .bail().isFloat({ min: 0 }).withMessage("gia phai lon hon 0"),
        body('category').notEmpty().withMessage("danh muc khong duoc de trong")
    ],

    validateResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(400).send({ message: result.errors });
            return;
        }
        next();
    }
};
