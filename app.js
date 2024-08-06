//npm init
//npm i express express-handlebars body-parser mongodb bcrypt express-session mongoose nodemailer multer
// Pls see comment regarding new codes.

const express = require('express');
const server = express();
const path = require('path');
const os = require('os');

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
  extname: 'hbs',
}));

//mongoose connection
const mongoose = require('mongoose');

const uri = "mongodb+srv://cnjerald1:1234@gabay.ptjm2vu.mongodb.net/Gabay?retryWrites=true&w=majority";

const clientOptions = {
    serverSelectionTimeoutMS: 5000,  // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,  // Close sockets after 45 seconds of inactivity
    family: 4,  // Use IPv4, skip trying IPv6
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
    }
};

// Attempt to connect to the database
async function connectToDatabase() {
  try {
      await mongoose.connect(uri, clientOptions);
      console.log('Load Successful.');
      const localIp = getLocalIpAddress();
      const accessUrl = `http://${localIp}:${port}`;
      console.log(`Access the server at ${accessUrl}`);
  } catch (err) {
      console.error('Load Failed.', err);
  }
}

connectToDatabase();

// Listen for connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from database');
});
//database models 
const personalInfo = require('./models/personalInfo');




server.use(express.static('public'));
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const Handlebars = require('handlebars');


Handlebars.registerHelper('incrementedIndex', function(index) {
  return index + 1;
});

Handlebars.registerHelper('capitalizeFirst', function(word) {
  if (typeof word === 'string' && word.length > 0) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return word;
});

Handlebars.registerHelper('ifEither', function(value, options) {
  if (value === 'Paid' || value === 'Expired') {
    return options.fn(this);  // Render the block
  }
  return options.inverse(this);  // Render the inverse block
});

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});


Handlebars.registerHelper('concat', function() {
  return Array.prototype.slice.call(arguments, 0, -1).join('');
});

// CONTROLLER 
const controllers = ['Routes'];
for(var i=0; i<controllers.length; i++){
  const controller = require('./controllers/'+controllers[i]);
  controller.add(server);
}

Handlebars.registerHelper('isStringInArray', function(value, array, options) {
  if (!Array.isArray(array)) {
      // If array is not defined or not an array, return false
      return options.inverse(this);
  }

  

  if (array.includes(value)) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }
});

Handlebars.registerHelper('concat', function() {
  // Retrieve all arguments passed to the helper
  var args = Array.prototype.slice.call(arguments, 0, -1);
  
  // Join all arguments into a single string
  return args.join('');
});



const port = process.env.PORT || 8080;
const host = '0.0.0.0';

// Function to get the local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
      for (const iface of interfaces[interfaceName]) {
          if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
          }
      }
  }
  return '127.0.0.1';
}

server.listen(port, host, () => {
  console.log('Server loading please wait.');
  
});
