let jwt = require('jsonwebtoken');
let userController = require('../controllers/users');

module.exports = {
    checkLogin: function (req, res, next) {
        try {
            let token;
            if (req.cookies.token) {
                token = req.cookies.token;
            } else {
                let authorizationToken = req.headers.authorization;
                if (!authorizationToken || !authorizationToken.startsWith("Bearer")) {
                    res.status(403).send({ message: "ban chua dang nhap" });
                    return;
                }
                token = authorizationToken.split(' ')[1];
            }
            let result = jwt.verify(token, 'FOOD_ORDER_SECRET');
            if (result.exp > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                res.status(403).send({ message: "token het han, vui long dang nhap lai" });
            }
        } catch (error) {
            res.status(403).send({ message: "ban chua dang nhap" });
        }
    },

    checkRole: function (...requiredRole) {
        return async function (req, res, next) {
            let userId = req.userId;
            let getUser = await userController.FindByID(userId);
            let roleName = getUser.role.name;
            if (requiredRole.includes(roleName)) {
                next();
            } else {
                res.status(403).send({ message: "ban khong co quyen thuc hien chuc nang nay" });
            }
        };
    }
};
