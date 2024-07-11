const { emit } = require('process');
const mongoose = require('mongoose');
const personalInfoModel = require('./personalInfo');
const eventsModel = require('./eventsInfo');
const nodemailer = require('nodemailer');

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



// This section is related to Paymongo

const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Basic c2tfdGVzdF96bTV1SjdVUG5zQjVHaDd5NzNLaTJhVkQ6'
    },
    body: JSON.stringify({data: {attributes: {amount: 10000, description: 'Test', remarks: 'Test'}}})
  };

const options2 = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: 'Basic c2tfdGVzdF96bTV1SjdVUG5zQjVHaDd5NzNLaTJhVkQ6'
  }
};

// This function generates a payment gateway link for a user.
function getPaymentLink() {

  return new Promise((resolve, reject) => {
    fetch('https://api.paymongo.com/v1/links', options)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch payment link');
        }
        return response.json();
      })
      .then(response => resolve({link : response.data.attributes.checkout_url, paymentID: response.data.attributes.reference_number}))
      .catch(err => {
        console.error(err);
        reject(err); // Propagate the error to the promise consumer
      });
  });
}
module.exports.getPaymentLink = getPaymentLink;

// This function checks if the payment status. Returns promise 'unpaid' or 'paid'
function checkPayment(id) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.paymongo.com/v1/links/${id}`, options2)
      .then(response => response.json())
      .then(response => resolve({status : response.data.attributes.status}))
      .catch(err => reject(err)); // Properly propagate the error
  });
}
module.exports.checkPayment= checkPayment;

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
  array.push((newPersonalInfo.img_path && newPersonalInfo.img_path.length > 1) ? 1 : 0); // 13
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
    personalInfoModel.find({}).lean().then(members => {
      resolve(members);
    }).catch(error => {
      reject(error);
    });
  });
}
module.exports.getMembers = getMembers;

// This function is a helper function that checks the membership status of the user.
function checkMembershipStatus(uic){
  console.log(uic);
  return new Promise((resolve, reject) => {
    personalInfoModel.findOne({uic_code: uic}).lean().then((function(user){
      if(user != undefined && user._id != null){
        resolve({name: user.last_name + ", " + user.first_name, memberUntil: user.memberUntil, uic: user.uic_code})
      } else{
        resolve(undefined);
      }
    }))
  });
}

module.exports.checkMembershipStatus = checkMembershipStatus;

// This function updates the membership status (Expiry date) of the user.

function updateMembershipStatus(uic) {
  return new Promise((resolve, reject) => {
    personalInfoModel.findOne({ uic_code: uic }).lean().then((user) => {
      if (user != undefined && user._id != null) {
        let today = new Date();

        // Extract the year, month, and day from the Date object
        let year = today.getFullYear() + 1; // plus 1 because i want it to be the next year.
        let month = today.getMonth() + 1; 
        let day = today.getDate();

        // Format the date as a string (e.g., YYYY-MM-DD)
        let formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (user.memberUntil == 'newuser') {
          personalInfoModel.updateOne({ _id: user._id }, { memberUntil: formattedDate })
            .then((result) => {
              resolve(result);
            }).catch((err) => {
              reject(err);
            });
        } else {
          let memberUntilDate = new Date(user.memberUntil);

          if (today <= memberUntilDate) {
            // Extend membership by 1 year from current expiration
            memberUntilDate.setFullYear(memberUntilDate.getFullYear() + 1);
          } else {
            // Extend membership by 1 year from today
            memberUntilDate = new Date(today);
            memberUntilDate.setFullYear(today.getFullYear() + 1);
          }

          // Format the new membership date
          let newFormattedDate = `${memberUntilDate.getFullYear()}-${String(memberUntilDate.getMonth() + 1).padStart(2, '0')}-${String(memberUntilDate.getDate()).padStart(2, '0')}`;

          personalInfoModel.updateOne({ _id: user._id }, { memberUntil: newFormattedDate })
            .then((result) => {
              resolve(result);
            }).catch((err) => {
              reject(err);
            });
        }
      } else {
        reject(new Error('User not found'));
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

module.exports.updateMembershipStatus = updateMembershipStatus;

// This function is in charge of the search queries and filter.
function searchFilter(searchString, sex, membership, membershipDetails, sort) {
  let searchQuery = {};

  if (searchString.length > 0) {
      searchQuery.name = { $regex: searchString, $options: 'i' }; // Case-insensitive regex
  } else {
      console.log("Empty");
  }

  if (sex !== "All") {
      searchQuery.sex = sex.toLowerCase();
  } else {
      console.log("All");
  }
  if (membership !== "All") {
    if(membership == "Community"){
      searchQuery.membership = "Community Member"
    } else{
      searchQuery.membership = membership;
    }
  } else {
    console.log("All");
  }
  if (membershipDetails !== "All") {
    if(membershipDetails === "Paid" || membershipDetails === "Not Paid"){
      searchQuery.membershipDetails = membershipDetails;
    } else{
      searchQuery.membershipDetails = { $regex: membershipDetails, $options: "i" };
    }
    
  } else {
    console.log("All");
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

function getEventDetails(name){
  return new Promise((resolve,reject)=>{
    const searchString = {name : name};
    eventsModel.findOne(searchString).lean().then(event =>{
      resolve(event);
    }).catch(err =>{
      reject(err);
    })
  })
}

module.exports.getEventDetails = getEventDetails;

function registerMemberToEvent(eventName, memberName) {
  console.log("NAME! " + memberName);

  return new Promise((resolve, reject) => {
    getEventDetails(eventName)
      .then(event => {
        let attendeeCount = event.attendees;
        let participants = event.participants;

        if (!participants.includes(memberName)) {
          participants.push(memberName); // Modify the array directly

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
  });
}
module.exports.registerMemberToEvent = registerMemberToEvent;

function getRegisteredMembers(eventName) {
  return new Promise((resolve, reject) => {
      getEventDetails(eventName).then(event => {
          let promises = [];
          event.participants.forEach(names => {
              let promise = personalInfoModel.findOne({ name: names }).lean().then(user => {
                  if (user != undefined && user._id != null) {
                      console.log("DB1 " + user.name);
                      console.log("DB1 " + user.uic_code);
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