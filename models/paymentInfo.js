const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    admin: { type: String },
    date_created : {type:String},
    user: { type: String},
    new_renewalDate : {type: String}

}, { versionKey: false });

const paymentModel = mongoose.model('paymentInfo', paymentSchema);

module.exports = paymentModel;