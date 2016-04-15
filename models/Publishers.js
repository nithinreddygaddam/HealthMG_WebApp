/**
 * Created by Nithin on 4/11/16.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var PublisherSchema = new mongoose.Schema({
    username:       {type: String, lowercase: true, unique: true},
    hash:           String,
    salt:           String,
    firstName:      {type: String, default: 'N/A'},
    lastName:       {type: String, default: 'N/A'},
    dateOfBirth:    {type: Number, min: 1, default: 20},
    gender:         {type: String, uppercase: true, enum: ['M', 'F'], default:'M'}
});

PublisherSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

PublisherSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

PublisherSchema.methods.generateJWT = function() {

    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        account: "publisher",
        exp: parseInt(exp.getTime() / 1000),
    }, 'SECRET');
};

mongoose.model('Publisher', PublisherSchema);