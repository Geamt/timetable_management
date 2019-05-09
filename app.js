var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');

var flash = require('connect-flash');
var validator = require('express-validator');
var mongoStore = require('connect-mongo')(session);
require('handlebars-helpers')(['comparison']);
var CheckAuth = require('./middleware/check-auth');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var hodRouter = require('./routes/hod');
var facultyRouter = require('./routes/faculty');
var scheduler = require('./routes/scheduler');

var app = express();

mongoose.connect('mongodb://localhost:27017/ttms', { useNewUrlParser: true });
//require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }));
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  name: process.env.SESS_NAME,
  secret: 'ttms',
  resave: false,
  saveUninitialized: false,
  store: new mongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000, sameSite: true }
}));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static('public'));
app.use('/admin', express.static('public'));
app.use('/hod', express.static('public'));
app.use('/faculty', express.static('public'));
app.use('/scheduler', express.static('public'));


app.use(function (req, res, next) {
  if (req.session.user_type != undefined) {
    console.log(req.session.user_type);
    if (req.session.user_type == 1) {
      res.locals.admin = true;
      res.locals.hod = false;
      res.locals.faculty = false;
      res.locals.scheduler = false;
    }
    else if (req.session.user_type == 2) {
      res.locals.admin = false;
      res.locals.hod = true;
      res.locals.faculty = false;
      res.locals.scheduler = false;
    }
    else if (req.session.user_type == 3) {
      res.locals.admin = false;
      res.locals.hod = false;
      res.locals.faculty = false;
      res.locals.scheduler = true;
    }
    else if (req.session.user_type == 4) {
      res.locals.admin = false;
      res.locals.hod = false;
      res.locals.faculty = true;
      res.locals.scheduler = false;
    }
  }
  console.log("admin : " + res.locals.admin + "\n" +
  "hod : " +res.locals.hod + "\n" +
  "faculty : " +res.locals.faculty + "\n" +
  "scheduler : " +res.locals.scheduler + "\n");
  
  //res.locals.session = req.session;
  next();
});


app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/hod', hodRouter);
app.use('/faculty', facultyRouter);
app.use('/scheduler', scheduler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
