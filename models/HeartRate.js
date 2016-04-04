/**
 * Created by Nithin on 4/2/16.
 */

var mongoose = require('mongoose');

var HeartRateSchema = new mongoose.Schema({
    time: String,
    date: String,
    hearRate: String
});

mongoose.model('HeartRate', HeartRateSchema);