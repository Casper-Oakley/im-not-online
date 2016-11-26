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

var AccountSchema = mongoose.Schema({
  name: String,
  aaa: String
}).index({name: 'text'});

var Account = app.account = restful.model('account', AccountSchema)
  .methods(['get', 'post', 'put', 'delete']);


Account.remove({}, function(){});

var seeds = [new Account({ name: 'Casper Oakley', aaa: 'cool'}),
  new Account({ name: 'Rich Davies', aaa: 'caool'}),
  new Account({ name: 'Elias Khoury', aaa: 'caaool'}),
  new Account({ name: 'Harry Bland', aaa: 'coaaaol'})];

seeds.forEach(function(e) {
  e.save(function (err) {
    if (err) {
      console.log(err);
    }
  });
});


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
  Account.find({$text: {$search: req.params.name}},{score: {$meta: "textScore"}}).
    sort({score: {$meta : 'textScore'}}).exec(function(err, docs) {
    if(err) {
      console.log(err);
      res.status(500).send(err);
      res.end();
    } else {
      res.status(200).json(docs);
    }
  });
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
