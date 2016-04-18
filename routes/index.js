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


router.get('/publisher/:username', function(req, res, next) {
    var query = Publisher.findOne({'username': req.params.username});
    query.exec(function (err, publisher){
        if (err) { return next(err); }
        if (!publisher) { return next(new Error("can't find publisher")); }
        res.send(publisher);

    });
});

router.get('/subscriptions', function(req, res, next) {
    Subscription.find(function(err, subscriptions){
        if(err){ return next(err); }

        res.json(subscriptions);
    });
});

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

router.post('/subscriptions', auth, function(req, res, next) {

    // console.log(req.body);
    // // console.log(req.body.subscription);


    var subscription = new Subscription(req.body);

    console.log(subscription);

    var query = Subscriber.findById(req.body.subscriber);
    var publisherUsername;
    
    query.exec(function (err, subscriber) {
        if (err) {
            return next(err);
        }
        if (!subscriber) {
            return next(new Error("can't find subscriber"));
        }
        subscription.subscriber = subscriber;
        console.log(subscriber._id);
    });

    var query2 = Publisher.findById(req.body.publisher);

    query2.exec(function (err, publisher){
        if (err) { return next(err); }
        if (!publisher) { return next(new Error("can't find publisher")); }
        subscription.publisher = publisher;
        publisherUsername = publisher.username;
        console.log(publisher._id);
    });

    // subscription.status = req.body.status;

    console.log(subscription);

    subscription.save(function(err,subscription) {
        if(err) {
            console.log(err);
            res.send({
                message :'something went wrong'
            });
        } else {
            console.log('saved subscription');
            // subscription.publisherUsername = publisherUsername;
            console.log(subscription);
            res.json(subscription);
        }

    });
    // subscription.save(function(err, subscription){
    //     if(err){ return next(err); }
    //
    //     res.json(subscription);
    // });
});


// // Preload post objects on routes with ':subscription'
// router.param('subscription', function(req, res, next, id) {
//  var query = Subscription.findById(id);
//
//  query.exec(function (err, subscription){
//    if (err) { return next(err); }
//    if (!subscription) { return next(new Error("can't find subscription")); }
//
//    req.subscription = subscription;
//    return next();
//  });
// });
//
// // return a subscription
// router.get('/subscriptions/:subscription', function(req, res, next) {
//  req.post.populate('comments', function(err, post) {
//    res.json(post);
//  });
// });



router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    if(req.body.account == "subscriber" ) {
        passport.authenticate('local-subscriber', function (err, subscriber, info) {
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
    else if(req.body.account == "publisher" ) {

        passport.authenticate('local-publisher', function (err, publisher, info) {
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

        subscriber.setPassword(req.body.password);

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

        publisher.setPassword(req.body.password);

        publisher.save(function (err) {
            if (err) {
                return next(err);
            }

            return res.json({token: publisher.generateJWT()})
        });
    }

});

module.exports = router;
