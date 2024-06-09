const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
    uic_code:{type:String},
    uic1: {type:String},
    uic2: {type:String},
    uic3: {type:String},
    uic4: {type:String},
    last_name: {type: String},
    middle_name: {type: String},
    first_name: {type: String},
    gender: {type: String},
    sex: {type: String},
    birthday: {type: String},
    contact_number: {type: String},
    email: {type: String},
    fb_account: {type: String},
    civil_status: {type: String},
    citizenship: {type: String},
    occupation: {type: String},
    designation: {type: String},
    company: {type: String}
  },{ versionKey: false });

  const personalInfoModel = mongoose.model('personalInfo', personalInfoSchema);
  
  module.exports = personalInfoModel;


