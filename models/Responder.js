const { emit } = require('process');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username : { type: String },
  password : { type: String }
}, { versionKey: false });

const loginModel = mongoose.model('adminInfo',adminSchema);
// DELETE THIS 

   // This is just for debug.
   const admin = new loginModel({
    username : "admin",
    password : "admin"
  })

  admin.save().then(()=>{
    console.log("Admin Created!");
  })


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



// Database and collection names here...
const databaseName = "Test";
const colUsers = "test";

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
    console.log(char_uic);
    console.log(num_uic);
    array.push(str_uic.length == 14 ? 1 : 0);
    array.push(
        onlyContainsLetters(char_uic) ? 1 : 0
    );
    array.push(
        onlyContainsNumbers(num_uic) ? 1 : 0
    );
    const fieldsToCheck = [
        { key: 'last_name', message: 1 },
        { key: 'middle_name', message: 1 }, 
        { key: 'first_name', message: 1 }, 
        { key: 'sex', message: 1 },
        { key: 'birthday', message: 1 },
        { key: 'contact_number', message: 1 },
        { key: 'email', message: 1 },
        { key: 'civil_status', message: 1 },
        { key: 'citizenship', message: 1 },
    ];
    fieldsToCheck.forEach(field => {
      array.push(newPersonalInfo[field.key] && newPersonalInfo[field.key].length > 0 ? field.message : 0);
  });

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

function onlyContainsLetters(str) {
  return /^[A-Za-z]+$/.test(str);
}

function onlyContainsNumbers(str) {
  return /^[0-9]+$/.test(str);
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