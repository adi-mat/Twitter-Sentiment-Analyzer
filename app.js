var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').createServer(app);
var port = 3000;
server.listen(port);
console.log("server listening at http://127.0.0.1:" + port);
var sio = require('socket.io').listen(server);
sio.sockets.on('connection', function(socket){
//console.log('web client connected');

var Twit = require('twit')

var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

var count_love=0;
var count_hate=0;
var total_count = 0;
var love_percentage = 0;
var hate_percentage = 0;
var stream = T.stream('statuses/filter', {track: ['love','hate']})
  stream.on('tweet', function(tweet){
    if(tweet.text.indexOf('hate')>-1)
    {
        
        socket.emit('lovetweet', {text:tweet.user.screen_name + ":" + tweet.text});
        count_love++;
	console.log(tweet.text);
	socket.emit('lovetweetcount', {text: count_love});
    }
    if(tweet.text.indexOf('love')>-1)
    {
        socket.emit('hatetweet', {text:tweet.user.screen_name + ":"  + tweet.text});
	console.log(tweet.text);
        count_hate++;
	socket.emit('hatetweetcount', {text: count_hate});
    }
 //   console.log(tweet.text);
    total_count = count_love + count_hate;
    love_percentage = (count_love/total_count)*100;
    hate_percentage = (count_hate/total_count)*100;
    
   // socket.volatile.emit('ss-confirmation', {text: tweet.user.screen_name+":"+tweet.text+":"+love_percentage+":"+hate_percentage});
    socket.emit('love', {text: love_percentage});
    socket.emit('hate', {text: hate_percentage});
    socket.emit('total', {text: total_count});
/*    if(count_love > count_hate)
    {
	socket.emit('text1', {text: "YAYYYYY MORE LOVE IN THE WORLD"});
    }
    else
    {
	socket.emit('text2', {text: "SADLY MORE HATE IN THE WORLD"});
    }*/
//    socket.emit('textpercentage', {text: "TWEET = " + tweet.user.screen_name+":"+tweet.text});
    
  });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
