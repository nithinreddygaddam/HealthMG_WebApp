var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var passport = require('passport');

var http = require('http').Server(express);
var io = require('socket.io')(http);

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


var mongoose = require('mongoose');
//var Post = mongoose.model('Post');
//var Comment = mongoose.model('Comment');
var Publisher = mongoose.model('Publisher');
var Subscriber = mongoose.model('Subscriber');
var HeartRate = mongoose.model('HeartRate');
var Subscription = mongoose.model('Subscription');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

http.listen(4000, function(){
  console.log('Listening on *:4000');
});

io.on('connection', function(clientSocket){
  console.log('a user connected');

  clientSocket.on('disconnect', function(){
    console.log('user disconnected');
  });
//save heart rate to database
    clientSocket.on('heartRate', function(time, date, hr){
        var heartR = new HeartRate();

        heartR.time = time;
        heartR.date = date;
        heartR.heartRate = hr;
        console.log(hr);
        heartR.save(function (err){
            if(err){ return next(err); }


        });
    });

});
//router.get('/posts', function(req, res, next) {
//  Post.find(function(err, posts){
//    if(err){ return next(err); }
//
//    res.json(posts);
//  });
//});
//
//router.post('/posts', auth, function(req, res, next) {
//  var post = new Post(req.body);
//  post.author = req.payload.username;
//
//  post.save(function(err, post){
//    if(err){ return next(err); }
//
//    res.json(post);
//  });
//});
//
//
//// Preload post objects on routes with ':post'
//router.param('post', function(req, res, next, id) {
//  var query = Post.findById(id);
//
//  query.exec(function (err, post){
//    if (err) { return next(err); }
//    if (!post) { return next(new Error("can't find post")); }
//
//    req.post = post;
//    return next();
//  });
//});
//
//// Preload comment objects on routes with ':comment'
//router.param('comment', function(req, res, next, id) {
//  var query = Comment.findById(id);
//
//  query.exec(function (err, comment){
//    if (err) { return next(err); }
//    if (!comment) { return next(new Error("can't find comment")); }
//
//    req.comment = comment;
//    return next();
//  });
//});
//
//
//// return a post
//router.get('/posts/:post', function(req, res, next) {
//  req.post.populate('comments', function(err, post) {
//    res.json(post);
//  });
//});
//
//
//// upvote a post
//router.put('/posts/:post/upvote', auth, function(req, res, next) {
//  req.post.upvote(function(err, post){
//    if (err) { return next(err); }
//
//    res.json(post);
//  });
//});
//
//
//// create a new comment
//router.post('/posts/:post/comments', auth, function(req, res, next) {
//  var comment = new Comment(req.body);
//  comment.post = req.post;
//  comment.author = req.payload.username;
//
//  comment.save(function(err, comment){
//    if(err){ return next(err); }
//
//    req.post.comments.push(comment);
//    req.post.save(function(err, post) {
//      if(err){ return next(err); }
//
//      res.json(comment);
//    });
//  });
//});
//
//
//// upvote a comment
//router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
//  req.comment.upvote(function(err, comment){
//    if (err) { return next(err); }
//
//    res.json(comment);
//  });
//});


router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    if(req.body.account = "subscriber" ) {
        passport.authenticate('local', function (err, subscriber, info) {
            if (err) {
                return next(err);
            }

            if (subscriber) {
                return res.json({token: subscriber.generateJWT()});
            } else {
                return res.status(401).json(info);
            }
        })(req, res, next);
    }
    else if(req.body.account = "publisher" ) {
        passport.authenticate('local', function (err, publisher, info) {
            if (err) {
                return next(err);
            }

            if (publisher) {
                return res.json({token: publisher.generateJWT()});
            } else {
                return res.status(401).json(info);
            }
        })(req, res, next);
    }
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
    
    if(req.body.account == "subscriber" ) {
        var subscriber = new Subscriber();

        subscriber.username = req.body.username;

        subscriber.setPassword(req.body.password)

        subscriber.save(function (err) {
            if (err) {
                return next(err);
            }

            return res.json({token: subscriber.generateJWT()})
        });
    }
    else if(req.body.account == "publisher" ){
        var publisher = new Publisher();

        publisher.username = req.body.username;

        publisher.setPassword(req.body.password)

        publisher.save(function (err) {
            if (err) {
                return next(err);
            }

            return res.json({token: publisher.generateJWT()})
        });
    }
    
});

module.exports = router;
