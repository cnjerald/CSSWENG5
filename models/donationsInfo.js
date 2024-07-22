const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    admin: { type: String },
    date_created : {type:String},
    user: { type: String},
    amount : {type: Number}

}, { versionKey: false });

const donationModel = mongoose.model('donationInfo', donationSchema);

module.exports = donationModel;