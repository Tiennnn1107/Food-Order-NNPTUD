var express = require('express');
var router = express.Router();
let { uploadImage } = require('../utils/uploadHandler');
let { checkLogin } = require('../utils/authHandler');
let path = require('path');

// POST /upload/single - upload 1 anh
router.post('/single', checkLogin, uploadImage.single('file'), function (req, res, next) {
    if (!req.file) {
        return res.status(400).send({ message: "khong co file duoc upload" });
    }
    res.send({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
    });
});

// POST /upload/multiple - upload nhieu anh (toi da 5)
router.post('/multiple', checkLogin, uploadImage.array('files', 5), function (req, res, next) {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ message: "khong co file duoc upload" });
    }
    let filesInfo = req.files.map(e => ({
        filename: e.filename,
        path: e.path,
        size: e.size
    }));
    res.send(filesInfo);
});

// GET /upload/:filename - xem anh da upload
router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(pathFile);
});

module.exports = router;