var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./index');
var usersRouter = require('./src/routes/users');
var authRouter = require('./src/routes/auth');
var applicationRouter = require('./src/routes/applications');
const session = require('express-session');

require('dotenv').config();

var app = express();
var cors = require('cors')
// app.use(cors())

app.use(cors({
  origin: ['http://localhost:5174'],
  credentials: true

}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {secure:false, httpOnly:false}
// }));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/applications', applicationRouter);

// app.use('/login', authRouter);
// app.use('/auth', authRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
