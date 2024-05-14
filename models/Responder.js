const { MongoClient, ObjectId } = require('mongodb');
const { emit } = require('process');
const databaseURL = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(databaseURL);


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


//Sample function that returns the input parameter.
function sampleFunction(parameter) {
    return new Promise((resolve, reject) => {
        resolve(parameter).catch(errorFn);
    });
}

module.exports.sampleFunction = sampleFunction;


// Closing 

function finalClose(){
    console.log('Close connection at the end!');
    mongoClient.close();
    process.exit();
}

process.on('SIGTERM',finalClose);  //general termination signal
process.on('SIGINT',finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands