const { MongoClient, ObjectId } = require('mongodb');
const { emit } = require('process');
const databaseURL = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(databaseURL);


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



mongoClient.connect().then(function(con){
  console.log("Attempt to create databases");
  const dbo = mongoClient.db(databaseName);

  dbo.createCollection(colUsers)
    .then(successFn).catch(errorFn);

}).catch(errorFn);


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
    
    array.push(newPersonalInfo.uic_code.length == 8 ? 1 : 0);
    array.push(
        onlyContainsLetters(newPersonalInfo.uic1) && onlyContainsLetters(newPersonalInfo.uic2) ? 1 : 0
    );
    array.push(
        onlyContainsNumbers(newPersonalInfo.uic3) && onlyContainsNumbers(newPersonalInfo.uic4) ? 1 : 0
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

function onlyContainsLetters(str) {
  return /^[A-Za-z]+$/.test(str);
}

function onlyContainsNumbers(str) {
  return /^[0-9]+$/.test(str);
}

// Clean Closing

function finalClose(){
    console.log('Close connection at the end!');
    mongoClient.close();
    process.exit();
}




process.on('SIGTERM',finalClose);  //general termination signal
process.on('SIGINT',finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands