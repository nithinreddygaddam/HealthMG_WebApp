/**
 * Created by Nithin on 4/11/16.
 */


var mongoose = require('mongoose');

var HeartRateSchema = new mongoose.Schema({
    time: String,
    date: String,
    uuid: String,
    hearRate: String,
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' }
});

mongoose.model('HeartRate', HeartRateSchema);