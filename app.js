var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const fileUpload = require('express-fileupload');
const hbs=require('express-handlebars')
// 
// const mongoose = require('mongoose');
// 
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(session({secret:"key",saveUninitialized:true,resave:false,cookie:{maxAge:60000*60}}));
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/temp/'
}));



app.use(logger('dev'));  
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/admin', adminRouter);
var db = require("./config/connection");

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//defined functions
let hb = hbs.create({})
hb.handlebars.registerHelper('eq',function(a,b){
  return a == b;
});


hb.handlebars.registerHelper('gte',function(a,b){
  return a >= b;
});

hb.handlebars.registerHelper('mul',function(a,b){
  return a*b;
});

hb.handlebars.registerHelper('inc',function(a,b){
  return parseInt(a) + 1;
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render('error');
});

module.exports = app;
