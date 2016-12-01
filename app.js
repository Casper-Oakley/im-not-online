var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    http = require('http'),
    request = require('request'),
    cookieParser = require('cookie-parser'),
    favicon = require('serve-favicon'),
    restful = require('node-restful'),
    async = require('async'),
    mongoose = restful.mongoose,
    bodyParser = require('body-parser');

var config = require('./config.json');


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

var seeds = [new Account({ name: 'Casper Oakley', steamid: 'STEAM_0:0:17640828'}),
  new Account({ name: 'Rich Davies', steamid: null}),
  new Account({ name: 'Elias Khoury', steamid: null}),
  new Account({ name: 'Harry Bland', steamid: 'STEAM_0:1:23385633'})];

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

app.post('/process', function(req, res) {
  if(req.body.name) {
    var results = {};
    async.waterfall([function(cb) {
        request( 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + config.steam + '&steamids=' + req.body.steamid, function(err, response, body) {
          if(err) {
            results.steamid = body;
            cb(null);
          } else {
            results.steamid = null;
            cb(null);
          }
        });
      }],function(err) {
    });
    if(req.body.steamid) {
    } else {
      results.steamid = null;
    }
    res.status(200).json(results);
  } else {
    res.status(400).send('Invalid input.');
    res.end();
  }
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
