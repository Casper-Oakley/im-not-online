var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    favicon = require('serve-favicon'),
    restful = require('node-restful'),
    mongoose = restful.mongoose,
    bodyParser = require('body-parser');


var app = express();

//Setup mongoose schema

mongoose.connect('mongodb://localhost/accounts');

var Account = app.account = restful.model('resource', mongoose.Schema({
    name: String,
    aaa: String
  }))
  .methods(['get', 'post', 'put', 'delete']);



//boilerplate express. Using EJS, body parser and cookie parser
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
//app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));


//routes for /, /{name} to get site and lookup accounts
//also, routes for account making

app.get('/', function(req, res) {
  res.render('index');
});

//Route for searching
app.get('/:name', function(req, res) {
  res.json({a:'b'});
  res.end();
});

Account.register(app, '/accounts');




//Any uncaught routes go to 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Once server instance setup, run socket IO
var server = app.listen(3000, function() {
  var host = 'localhost';
  var port = server.address().port;
  console.log('App listening at http://' + host + ':' + port);
});

module.exports = app;
