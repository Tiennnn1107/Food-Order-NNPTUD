var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.send({ message: "Food Order API dang chay" });
});

module.exports = router;
