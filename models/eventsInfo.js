const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
    name : {type : String},
    date : {type : String},
    attendees : {type: Number, default: 0},
    participants : {type: [String], default : []}
}, { versionKey: false });

const eventsModel = mongoose.model('eventsInfo', eventsSchema);

module.exports = eventsModel;