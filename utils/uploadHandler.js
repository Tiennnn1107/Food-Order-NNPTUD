let multer = require('multer');
let path = require('path');
let fs = require('fs');

const UPLOAD_DIR = 'uploads/';
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        let fileName = Date.now() + '-' + Math.round(Math.random() * 1_000_000_000) + ext;
        cb(null, fileName);
    }
});

let customFileFilterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error("chi chap nhan file anh"), false);
    }
};

let customFileFilterExcel = function (req, file, cb) {
    if (file.mimetype.includes('spreadsheetml')) {
        cb(null, true);
    } else {
        cb(new Error("chi chap nhan file excel"), false);
    }
};

module.exports = {
    uploadImage: multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: customFileFilterImage
    }),
    uploadExcel: multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: customFileFilterExcel
    })
};
