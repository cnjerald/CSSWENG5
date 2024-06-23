const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  school: { type: String },
  course: { type: String },
  educationYear: { type: String }
}, { _id: false });

const medicationSchema = new mongoose.Schema({
  medication: { type: String },
  startDate: { type: String }
}, { _id: false });

const conditionSchema = new mongoose.Schema({
  condition: { type: String }
}, { _id: false });

const personalInfoSchema = new mongoose.Schema({
  uic_code: { type: String },
  img_path: {type: String},
  name: {type : String},
  gender: { type: String },
  sex: { type: String },
  birthday: { type: String},
  contact_number: { type: String },
  email: { type: String },
  fb_account: { type: String },
  civil_status: { type: String },
  citizenship: { type: String },
  occupation: { type: String },
  designation: { type: String },
  company: { type: String },
  entries: [entrySchema], 
  medications: [medicationSchema], 
  conditions: [conditionSchema], 
  ePerson: { type: String },
  eContact: { type: String },
  eRelationship: { type: String },
  eAddress: { type: String },
  comments: { type: String },
  membership: {type: String},
  membershipDetails: {type: String},
  memberUntil: { type: String, default: "newuser" },
  reminderSent: {type:Boolean, default:false}
}, { versionKey: false });

const personalInfoModel = mongoose.model('personalInfo', personalInfoSchema);

module.exports = personalInfoModel;