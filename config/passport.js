
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Subscriber = mongoose.model('Subscriber');
var Publisher = mongoose.model('Publisher');

passport.use('local-subscriber', new LocalStrategy(
  function(username, password,  done) {

      Subscriber.findOne({username: username}, function (err, subscriber) {
        if (err) {
          return done(err);
        }
        if (!subscriber) {
          return done(null, false, {message: 'Incorrect subscriber username.'});
        }
        if (!subscriber.validPassword(password)) {
          return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, subscriber);
      });
    }

));

passport.use('local-publisher', new LocalStrategy(
    function(username, password,  done) {

          Publisher.findOne({username: username}, function (err, publisher) {
            if (err) {
              return done(err);
            }
            if (!publisher) {
              return done(null, false, {message: 'Incorrect publisher username.'});
            }
            if (!publisher.validPassword(password)) {
              return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, publisher);
          });

    }

));
