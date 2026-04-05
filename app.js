var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
let mongoose = require('mongoose');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cấu hình CORS chi tiết
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://localhost:27017/food-order');
mongoose.connection.on('connected', async function () {
  console.log("da connect mongodb");
  
  // Tu dong tao Roles neu chua co
  const roleModel = require('./schemas/roles');
  const roles = [
    { name: 'ADMIN', description: 'quan tri vien' },
    { name: 'CUSTOMER', description: 'khach hang' },
    { name: 'MODERATOR', description: 'quan ly' }
  ];

  for (let role of roles) {
    let exist = await roleModel.findOne({ name: role.name });
    if (!exist) {
      await roleModel.create(role);
      console.log(`Da tao role: ${role.name}`);
    }
  }
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/roles', require('./routes/roles'));
app.use('/auth', require('./routes/auth'));
app.use('/categories', require('./routes/categories'));
app.use('/foods', require('./routes/foods'));
app.use('/orders', require('./routes/orders'));
app.use('/reviews', require('./routes/reviews'));
app.use('/cart', require('./routes/cart'));
app.use('/upload', require('./routes/upload'));
app.use('/addresses', require('./routes/addresses'));
app.use('/vouchers', require('./routes/vouchers'));

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send({ message: err.message });
});

module.exports = app;
