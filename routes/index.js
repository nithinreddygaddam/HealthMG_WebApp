var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var passport = require('passport');
var synchronize = require('synchronize');

var http = require('http').Server(express);
var io = require('socket.io')(http);

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Publisher = mongoose.model('Publisher');
var Subscriber = mongoose.model('Subscriber');
var HeartRate = mongoose.model('HeartRate');
var Subscription = mongoose.model('Subscription');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

http.listen(4007, function(){
    console.log('Listening on *:4007');
});

// Socket code for interacting with the mobile app
io.on('connection', function(clientSocket){
    console.log('a user connected');

    clientSocket.on('disconnect', function(){
        console.log('user disconnected');
    });
//save heart rate to database
    clientSocket.on('heartRate', function(timeStamp, date, time, hr, uuid, publisher){
        var heartR = new HeartRate();

        heartR.timeStamp = timeStamp;
        heartR.time = time;
        heartR.date = date;
        heartR.heartRate = hr;
        heartR.uuid = uuid;
        heartR.publisher = publisher;
        heartR.save(function (err){
            if(err){ return next(err); }

        });
    });

    clientSocket.on('login', function(username, password){

        //plubisher here is a general user

        Publisher.findOne({username: username}, function (err, publisher) {
            if (err) {
              return next(err);
            }
            if (!publisher) {
              io.emit("error", "Invalid username");
              return next(err);
            }
            if (!publisher.validPassword(password)) {
              io.emit("error", "Invalid password");
              return next(err);
            }
            console.log("User logged in");
            console.log(publisher);

            var user = publisher;

             io.emit("successLogin", user);

        });

    }); 

    clientSocket.on('register', function(username, password, firstName, lastName){
         console.log("Registering User");
        var user = new Publisher();

        user.username = username;
        user.setPassword(password);
        user.firstName = firstName;
        user.lastName = lastName;

        console.log(user);

        user.save(function (err) {
            if (err) {
                return next(err);
            }

            Publisher.findOne({username: username}, function (err, publisher) {
            if (err) {
                io.emit("error", "Error in registering");
              return next(err);
            }

            console.log("User registered");
            console.log(publisher);
            io.emit("successRegistering", publisher);

          });
        });

    });

    clientSocket.on('getPublishersList', function(user){

        var arrPublishers = [];
        var itemsProcessed = 0;

        console.log("Getting subscriptions");
        console.log(user._id);
        //plubisher here is a general user

var q = Subscription.find({subscriber: user._id});
        q.exec(function (err, subscriptions) {
            if (err) {
                console.log("error finding subscribers");
              return next(err);
            }
            else{
                if(subscriptions.length === 0){
                    io.emit("successPubList", arrPublishers);
                }
                console.log("Found subscriptions");
                console.log(subscriptions);
                subscriptions.forEach( function(subscription) {
                if(subscription.subscriber == user._id){
                        var query = Publisher.findById(subscription.publisher);
                        query.exec(function (err, publisher) {
                            if (err) {
                                return next(err);
                            }
                            if (!publisher) {
                                return next(new Error("can't find user"));
                            }
                            arrPublishers.push(publisher); 
                            itemsProcessed ++;

                            if( itemsProcessed == subscriptions.length){
                                console.log("User subscriptions");
                               io.emit("successPubList", arrPublishers);
                            }

                        });

                }

                });

                
            }
            
            });
    });

    clientSocket.on('getHeartRates', function(user){

 var emptyFlag = 0;
        console.log("Getting heart Rates");
        console.log(user._id);

        var q = HeartRate.find({publisher: user._id, date: "05/11"}).sort({timeStamp: -1});
        q.exec(function(err, latestRecords) {
        if (err) {
            return next(err);
        }
        if (latestRecords.length === 0){
            emptyFlag = 1;
            console.log("Heart rate data empty for user")
        }
        // console.log(latestRecords);
        io.emit("successHeartRates", latestRecords, emptyFlag);        
        });
    });

    clientSocket.on('getLatestRecords', function(user){

        console.log("Getting latest records");
        var emptyFlag = 0;
        var q = HeartRate.find({publisher: user._id}).limit(1).sort({timeStamp: -1});
        q.exec(function(err, latestRecords) {
        if (err) {
            return next(err);
        }
        if (latestRecords.length === 0){
            emptyFlag = 1;
            console.log("Heart rate data empty for user")
        }
        console.log(latestRecords);
        io.emit("successLatestRecords", latestRecords, emptyFlag);        
        });
    });


    clientSocket.on('addSubscription', function(_id, username){

        //plubisher here is a general user

        var subscription = new Subscription();
        var publisherObject;
        // var itemsProcessed = 0;

        Publisher.findOne({username: username}, function (err, publisher) {
            if (err) { 
                 console.log('error finding user');
                return next(err); }
            if (!publisher) { return next(new Error("can't find publisher")); }
            subscription.publisher = publisher._id;
            subscription.subscriber = _id;
            subscription.active = 'ACTIVE';
            // arrPublishers.push(publisher);
            publisherObject = publisher;
            console.log(publisher._id);
            console.log("Subscription: " + subscription);

            subscription.save(function(err,subscription) {
                if(err) {
                    console.log(err);
                    res.send({
                        message :'something went wrong'
                    });
                } else {
                    console.log('saved subscription');
                    io.emit("successSubscribing", publisherObject);
            }
        });

        });
    });

});

router.get('/publisher/:username', function(req, res, next) {
    var query = Publisher.findOne({'username': req.params.username});
    query.exec(function (err, publisher){
        if (err) { return next(err); }
        if (!publisher) { return next(new Error("can't find publisher")); }
        res.send(publisher);

    });
});


router.get('/subscriptions', function(req, res, next) {
    console.log("get all");
    var arrPublishers = [];
    var itemsProcessed = 0;


    Subscription.find(function(err, subscriptions) {
        if (err) {
            return next(err);
        }
        subscriptions.forEach( function(subscription) {

            var query = Publisher.findById(subscription.publisher);
            query.exec(function (err, publisher) {
                if (err) {
                    return next(err);
                }
                if (!publisher) {
                    return next(new Error("can't find publisher"));
                }
                arrPublishers.push(publisher); 
                itemsProcessed ++;

                if( itemsProcessed == subscriptions.length){
                    res.json(arrPublishers);
                }

            });

        });

    });


});

router.post('/subscriptions', auth, function(req, res, next) {

    var subscription = new Subscription(req.body);

    console.log(subscription);

    var query = Subscriber.findById(req.body.subscriber);
    var publisherObject;

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
        publisherObject = publisher;
        console.log(publisher._id);
    });

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
            // console.log(subscription);
            res.json(publisherObject);
        }

    });

});


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
