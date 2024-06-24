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



//Paymongo

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




function errorFn(err){
    console.log('Error found. Please trace!');
    console.error(err);
}

function successFn(res){
    console.log('Database query successful!');
}





// Helper Functions Here


// - Sample function that returns the input parameter.
function sampleFunction(parameter) {
    return new Promise((resolve, reject) => {
        resolve(parameter).catch(errorFn);
    });
}
//Export this as a function name.
module.exports.sampleFunction = sampleFunction;


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
  array.push(isValidDate(newPersonalInfo.birthday));
  array.push(onlyContainsNumbers(newPersonalInfo.contact_number) ? 1 : 0);

    resolve(array).catch(errorFn);
  })
  
}
module.exports.checkPersonalInfo = checkPersonalInfo;


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
    searchQuery.membership = membership;
  } else {
    console.log("All");
  }
  if (membershipDetails !== "All") {
    searchQuery.membershipDetails = { $regex: membershipDetails, $options: "i" };
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
// Clean Closing

function finalClose(){
  console.log('Close connection at the end!');
  mongoose.connection.close();
  process.exit();
}

process.on('SIGTERM',finalClose);  //general termination signal
process.on('SIGINT',finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands