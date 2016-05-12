/**
 * Created by Nithin on 4/11/16.
 */


var mongoose = require('mongoose');

var SubscriptionSchema = new mongoose.Schema({
    status:         { type: String, uppercase: true, enum: ['ACTIVE', 'SUSPENDED'], default:'ACTIVE' },
    publisher:      { type: String },
    subscriber:      { type: String }

});

SubscriptionSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

mongoose.model('Subscription', SubscriptionSchema);