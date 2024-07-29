const { emit } = require('process');
const mongoose = require('mongoose');
const personalInfoModel = require('./personalInfo');
const eventsModel = require('./eventsInfo');
const paymentModel = require('./paymentInfo');
const donationModel = require("./donationsInfo");
const nodemailer = require('nodemailer');
const { query } = require('express');

const adminSchema = new mongoose.Schema({
  username : { type: String },
  password : { type: String }
}, { versionKey: false });

const loginModel = mongoose.model('adminInfo',adminSchema);

// This section is used as a method to automatically send email reminders to users.

/*  
    Please read this before you put your email for testing.
    This function is responsible for the reminders sent tru email.
    Do not PUSH a file in GITHUB with your EMAIL and APP password in it. 
    YOU MIGHT/WILL GET HACKED. CAN'T GUARANTEE.
*/ 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
   user: '', // Email of sender
   pass: '', // app password (Settings > Set up app password)  REMEMBER THE REMINDER
  },
 });

 /*
  How does it work:
    1. It gets all members.
    2. It checks if the expiry is GREATER than or equal to 1 month from this day AND
    3. Check if the machine has sent a reminder.
    4. Push emails of users in the emailList
    4. It changes the reminderSent of each user to true (This is done first- might be optimzied?)
    5. Email is sent to emailList.
 */

    
function errorFn(err){
  console.log('Error found. Please trace!');
  console.error(err);
}

function successFn(res){
  console.log('Database query successful!');
}


 function checkOneMonth() {
  let emailList = [];
  getMembers().then(members => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to 00:00:00 for accurate comparison
    members.forEach(member => {
      const memberUntilDate = new Date(member.memberUntil);
      memberUntilDate.setMonth(memberUntilDate.getMonth() - 1);
      memberUntilDate.setHours(0, 0, 0, 0); // Set the time to 00:00:00 for accurate comparison

      if (memberUntilDate.getTime() <= today.getTime() && !member.reminderSent) {
        console.log("Reminder needed for member:", member._id);
        emailList.push(member.email);
        // update the mongoDB isSent to prevent multiple sends 
        personalInfoModel.updateOne({ _id: member._id }, { reminderSent: true })
        .then(() => {
          console.log("Updated reminderSent ");
        })
        .catch((err) => {
          console.error("Error updating reminderSent field:", err);
        });
      }
    });//foreach

    // Set mail options
    let mailOptions = {
      from: '', // sender address
      to: emailList, // receiver's address
      subject: 'Membership Expiry Reminder', // Subject line
      text: 'Hello, your membership will expire in one month.' // of subject (can be changed to HTML)
    };
    // Send
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully.");
      }
    });
  }).catch(error => {
    console.error("Error fetching members:", error);
  });
}

module.exports.checkOneMonth = checkOneMonth;

//This fuction fulfills the ajax request register-checker it checks for invalid inputs during registration.
function checkPersonalInfo(newPersonalInfo){
  return new Promise((resolve,reject)=>{
    let array = [];
    newPersonalInfo.uic_code
    let str_uic = newPersonalInfo.uic_code;
    let char_uic = (str_uic.slice(0, 4)).toUpperCase();
    let num_uic = str_uic.slice(-10);

    array.push(str_uic.length == 14 ? 1 : 0); // arr[0] >UIC Length
    array.push(
        onlyContainsLetters(char_uic) ? 1 : 0 // arr[1] allCharUICpart
    );
    array.push(
        onlyContainsNumbers(num_uic) ? 1 : 0 // arr[2] allIntUICPart
    );
    const fieldsToCheck = [
        { key: 'name', message: 1 },
        { key: 'sex', message: 1 },
        { key: 'birthday', message: 1 },
        { key: 'contact_number', message: 1 },
        { key: 'email', message: 1 },
        { key: 'civil_status', message: 1 },
        { key: 'citizenship', message: 1 },
    ];
    fieldsToCheck.forEach(field => {
      array.push(newPersonalInfo[field.key] && newPersonalInfo[field.key].length > 0 ? field.message : 0); // arr[3-9] checkNull
  });
  array.push(isValidDate(newPersonalInfo.birthday)); // 10
  array.push(onlyContainsNumbers(newPersonalInfo.contact_number) ? 1 : 0); // 11
  array.push(isValidEmail(newPersonalInfo.email)? 1 : 0); // 12
  array.push((newPersonalInfo.img_path && newPersonalInfo.img_path.length > 1) ? 1 : 1); // 13
  console.log(array);
    resolve(array).catch(errorFn);
  })
  
}
module.exports.checkPersonalInfo = checkPersonalInfo;

// This function fulfills the ajax request login-checker. It is used to check the username and password of the admin.
function getUser(username, password) {
  return new Promise((resolve,reject)=>{

    const searchQuery = {username : username, password: password}

    loginModel.findOne(searchQuery).then((function(login){
      if(login != undefined && login._id != null){
        resolve(1);
      } else{
        resolve();
      }
    }))
  })
}
module.exports.getUser = getUser;

// This function is a helper function that queries all registered members and their details.
function getMembers() {
  return new Promise((resolve, reject) => {
    personalInfoModel.find({status:"Active"}).lean().then(members => {
      resolve(members);
    }).catch(error => {
      reject(error);
    });
  });
}
module.exports.getMembers = getMembers;


// This function is a helper function that queries all registered members and their details. (including deceased and terminated)
function getAllMembers() {
  return new Promise((resolve, reject) => {
    personalInfoModel.find({}).lean().then(members => {
      resolve(members);
    }).catch(error => {
      reject(error);
    });
  });
}
module.exports.getAllMembers = getAllMembers;

// This function is a helper function that checks the membership status of the user.
async function checkMembershipStatus() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set to the beginning of the day

    const users = await personalInfoModel.find({ membership: "Registered" }).lean();

    const updatePromises = users.map(user => {
      if(user.renewalDate){
        const renewalDate = new Date(user.renewalDate);
        const renewalDatePlusOneYear = new Date(renewalDate.setFullYear(renewalDate.getFullYear() + 1));
        let updateOperation;
  
        if (renewalDatePlusOneYear < today) {
          updateOperation = personalInfoModel.updateOne(
            { _id: user._id },  // Query to match the specific user
            { $set: { membershipDetails: "Expired" } }  // Update operation
          );
        } else {
          updateOperation = personalInfoModel.updateOne(
            { _id: user._id },  // Query to match the specific user
            { $set: { membershipDetails: "Paid" } }  // Update operation
          );
        }
  
        return updateOperation.catch(err => {
          console.error(`Error updating user ${user._id}:`, err);
        });
      }

    });

    await Promise.all(updatePromises);  // Wait for all updates to complete
    console.log('Membership status check and updates completed.');
  } catch (err) {
    console.error('Error fetching or updating users:', err);
  }
}


module.exports.checkMembershipStatus = checkMembershipStatus;


// This function is in charge of the search queries and filter.
function searchFilter(searchString, sex, membership,status, membershipDetails, sort) {
  let searchQuery = {};

  if (searchString.length > 0) {
      searchQuery.name = { $regex: searchString, $options: 'i' }; // Case-insensitive regex
  } 

  if (sex !== "All") {
      searchQuery.sex = sex.toLowerCase();
  } 

  if(status !=="All"){
    searchQuery.status = status;
  }


  if (membership !== "All") {
    if(membership == "Community"){
      searchQuery.membership = "Community Member"
    } else{
      searchQuery.membership = membership;
    }
  } 
  if (membershipDetails !== "All") {
    if(membershipDetails === "Paid" || membershipDetails === "Not Paid" || membershipDetails === "Expired"){
      searchQuery.membershipDetails = membershipDetails;
    } else{
      searchQuery.membershipDetails = { $regex: membershipDetails, $options: "i" };
    }
    
  } 
  return new Promise((resolve, reject) => {
      let query = personalInfoModel.find(searchQuery).lean();

      // Add sorting logic
      if (sort === "Name") {
          query = query.sort({ name: 1 }); // Sort by name in ascending order
      } else if (sort === "Sex") {
          query = query.sort({ sex: -1 }); // Sort by sex in ascending order
      } else if (sort === "Membership") {
          query = query.sort({ membership: 1 }); // Sort by membership in ascending order
      }

      query.then(members => {
          resolve(members);
      }).catch(error => {
          reject(error);
      });
  });
}

module.exports.searchFilter = searchFilter;

// This function gets all the listed events
  function getEvents(){
    return new Promise((resolve, reject) => {
      eventsModel.find({}).lean().then(events => {
        resolve(events);
      }).catch(error => {
        reject(error);
      });
    });
  }

module.exports.getEvents = getEvents;

function getEventDetails(id){
  return new Promise((resolve,reject)=>{
    const searchString = {_id : id};
    eventsModel.findOne(searchString).lean().then(event =>{
      resolve(event);
    }).catch(err =>{
      reject(err);
    })
  })
}

module.exports.getEventDetails = getEventDetails;

function registerMemberToEvent(eventid, memberName) {
  return new Promise((resolve, reject) => {
    getEventDetails(eventid)
      .then(event => {
        if(event){
          let attendeeCount = event.attendees;
          let participants = event.participants;
          personalInfoModel.findOne({name: memberName}).lean().then(member=>{
            if (!participants.includes(member._id)) {
              participants.push(member._id); // Modify the array directly
    
              eventsModel.updateOne(
                { _id: event._id },
                { attendees: attendeeCount + 1, participants: participants }
              )
              .then(() => {
                resolve(event);
              })
              .catch(error => {
                console.error(error);
                reject(error);
              });
            } else {
              resolve(event);
            }
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
        }


        })

  });
}
module.exports.registerMemberToEvent = registerMemberToEvent;

function getRegisteredMembers(eventid) {
  return new Promise((resolve, reject) => {
      getEventDetails(eventid).then(event => {
          let promises = [];
          event.participants.forEach(names => {
              let promise = personalInfoModel.findOne({ _id: names }).lean().then(user => {
                  if (user != undefined && user._id != null) {
                      return user;
                  }
              });
              promises.push(promise);
          });
          Promise.all(promises).then(results => {
              resolve(results.filter(user => user != undefined));
          }).catch(err => {
              reject(err);
          });
      }).catch(err => {
          reject(err);
      });
  });
}

module.exports.getRegisteredMembers = getRegisteredMembers;

function getPayments(){
  return new Promise((resolve,reject)=>{
    paymentModel.find({}).lean().then(payments =>{
      return(payments);
    })
  })
}
module.exports.getPayments = getPayments;


function groupByDate(payments) {
  const grouped = {};

  payments.forEach(payment => {
    const date = new Date(payment.new_renewalDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    // Use a string with an underscore prefix for the year to ensure proper sorting
    const yearKey = `Year_${year}`;

    if (!grouped[yearKey]) {
      grouped[yearKey] = {};
    }
    if (!grouped[yearKey][month]) {
      grouped[yearKey][month] = [];
    }
    grouped[yearKey][month].push(payment);
  });

  // Convert the grouped object to an array for sorting
  const sortedGrouped = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))  // Sort years in descending order
    .reduce((acc, [yearKey, months]) => {
      acc[yearKey] = {};
      Object.entries(months)
        .sort(([a], [b]) => {
          const monthA = new Date(Date.parse(a + " 1, 2000")).getMonth();
          const monthB = new Date(Date.parse(b + " 1, 2000")).getMonth();
          return monthB - monthA;  // Sort months from December to January
        })
        .forEach(([month, payments]) => {
          acc[yearKey][month] = payments;
        });
      return acc;
    }, {});

  return sortedGrouped;
}
module.exports.groupByDate= groupByDate;

function groupByDateDonations(donations) {
  const grouped = {};

  donations.forEach(donation => {
    const date = new Date(donation.date_created.replace(/-/g, '/')); // Handle date format
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    const yearKey = `Year_${year}`;

    if (!grouped[yearKey]) {
      grouped[yearKey] = {};
    }
    if (!grouped[yearKey][month]) {
      grouped[yearKey][month] = [];
    }
    grouped[yearKey][month].push(donation);
  });

  // Convert the grouped object to an array for sorting
  const sortedGrouped = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))  // Sort years in descending order
    .reduce((acc, [yearKey, months]) => {
      acc[yearKey] = {};
      Object.entries(months)
        .sort(([a], [b]) => {
          const monthA = new Date(Date.parse(a + " 1, 2000")).getMonth();
          const monthB = new Date(Date.parse(b + " 1, 2000")).getMonth();
          return monthB - monthA;  // Sort months from December to January
        })
        .forEach(([month, donations]) => {
          acc[yearKey][month] = donations;
        });
      return acc;
    }, {});

  return sortedGrouped;
}

module.exports.groupByDateDonations = groupByDateDonations;

function getRegisteredmembership() {

  return new Promise((resolve,reject)=>{
    personalInfoModel.find({membership: "Registered"}).lean().then(users=>{
      resolve(users);
    })
  })

}
module.exports.getRegisteredmembership = getRegisteredmembership;


function querySelectedMembership(name, uic) {
  return new Promise((resolve, reject) => {
    personalInfoModel.findOne({ name: name, uic_code: uic }).lean().then(user => {
      if (!user) {
        return reject(new Error('User not found'));
      }
      const query = paymentModel.find({ user: user._id }).lean();
      query.sort({ new_renewalDate: -1 }).then(payments => {
        resolve(payments);
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}
module.exports.querySelectedMembership = querySelectedMembership;


const getUserID = async (name, uic) => {

  try {
    const user = await personalInfoModel.findOne({ name: name, uic_code: uic }).lean();
    if (!user) {
      throw new Error('User not found');
    }
    return user._id;
  } catch (error) {
    throw error;
  }
};

module.exports.getUserID = getUserID;

async function updateMembershipRecord(id, latestDate) {
  try {
    const user = await personalInfoModel.findOne({_id: id}).lean();
    if (user) {
      console.log("Does this work? " + user.name);
      
      // Convert dates to comparable formats
      const latest = new Date(latestDate);
      const renewal = new Date(user.renewalDate);
      console.log(latest);
      console.log(renewal);

      // Compare dates
      if (latest != renewal) {
        console.log("Hello World.");

        // Format the latest date to YYYY-MM-DD
        const formattedLatestDate = latest.toISOString().split('T')[0];

        await personalInfoModel.updateOne({_id: user._id}, {renewalDate: formattedLatestDate});
        console.log("Renewal date updated.");
      } else {
        console.log("No update needed. Latest date is not greater than renewal date.");
      }
    } else {
      console.log("User not found.");
    }
  } catch (err) {
    console.error("Error finding user:", err);
  }
}
module.exports.updateMembershipRecord = updateMembershipRecord;

function deletePayment_ajax(id) {
  paymentModel.findOneAndDelete({ _id: id }).lean().then(transaction => {
      if (transaction) {
          console.log("Transaction deleted:", transaction);
      } else {
          console.log("Transaction not found.");
      }
  }).catch(err => {
      console.error("Error deleting transaction:", err);
  });
}

module.exports.deletePayment_ajax = deletePayment_ajax;

function queryDonations(name, uic){
  return new Promise((resolve, reject) => {
    personalInfoModel.findOne({ name: name, uic_code: uic }).lean().then(user => {
      if (!user) {
        return reject(new Error('User not found'));
      }
      const query = donationModel.find({ user: user._id }).lean();
      query.sort({ date_created: -1 }).then(donations => {
        resolve(donations);
      }).catch(err => {
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}
module.exports.queryDonations = queryDonations;

function deleteDonation_ajax(id) {
  donationModel.findOneAndDelete({ _id: id }).lean().then(donation => {
      if (donation) {
          console.log("Transaction deleted:", donation);
      } else {
          console.log("Transaction not found.");
      }
  }).catch(err => {
      console.error("Error deleting transaction:", err);
  });
}

module.exports.deleteDonation_ajax = deleteDonation_ajax;


// Helper functions

function onlyContainsLetters(str) {
  return /^[A-Za-z]+$/.test(str);
}

function onlyContainsNumbers(str) {
  return /^[0-9]+$/.test(str);
}

function isValidDate(date) {
  // Create a new Date object from the input date
  const inputDate = new Date(date);
  
  // Get today's date without the time component
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Compare the input date with today's date
  if (inputDate > today) {
    return 0;
  } else {
    return 1;
  }
}


function isValidEmail(email) {
  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function checkPicture(profilePicturePath) {
  return (profilePicturePath === null || profilePicturePath === undefined) ? 0 : 1;
}


// Clean Closing
function finalClose(){
  console.log('Close connection at the end!');
  mongoose.connection.close();
  process.exit();
}

process.on('SIGTERM',finalClose);  //general termination signal
process.on('SIGINT',finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands