
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Subscriber = mongoose.model('Subscriber');
var Publisher = mongoose.model('Publisher');

passport.use(new LocalStrategy(
  function(username, password, done) {
      Subscriber.findOne({username: username}, function (err, subscriber) {
        if (err) {
          // return done(err);
          Publisher.findOne({username: username}, function (err, publisher) {
            if (err) {
              return done(err);
            }
            if (!publisher) {
              return done(null, false, {message: 'Incorrect username.'});
            }
            if (!publisher.validPassword(password)) {
              return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, publisher);
          });
        }
        if (!subscriber) {
          return done(null, false, {message: 'Incorrect username.'});
        }
        if (!subscriber.validPassword(password)) {
          return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, subscriber);
      });
    }

));
