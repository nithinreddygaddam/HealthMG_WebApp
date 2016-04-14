/**
 * Created by Nithin on 4/11/16.
 */

var mongoose = require('mongoose');

var SubscriptionSchema = new mongoose.Schema({
    status:         { type: String, uppercase: true, enum: ['Active', 'Suspended'], default:'Active' },
    Publisher:      { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' },
    Subscriber:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subscriber' },
    created_at:     { type: Date },
    updated_at:     { type: Date }
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