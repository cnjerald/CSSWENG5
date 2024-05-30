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



// Clean Closing

function finalClose(){
    console.log('Close connection at the end!');
    mongoClient.close();
    process.exit();
}

process.on('SIGTERM',finalClose);  //general termination signal
process.on('SIGINT',finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands