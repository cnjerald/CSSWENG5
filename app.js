//npm init
//npm i express express-handlebars body-parser mongodb bcrypt express-session mongoose
// Pls see comment regarding new codes.

const express = require('express');
const server = express();

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
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
      console.log('Database connected successfully');
  } catch (err) {
      console.error('Database connection error:', err);
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


const Handlebars = require('handlebars');

Handlebars.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 1; i <= n; ++i)
      accum += block.fn(i);
  return accum;
});


// Register the nested loop helper
Handlebars.registerHelper('nestedLoop', function(count, options) {
  var ret = "";

  // Validate input
  if (typeof count !== 'number' || count < 0) {
      throw new Error("Invalid input: Count must be a non-negative number");
  }

  // Outer loop
  for (var i = 1; i <= count; i++) {
      // Pass outer loop index to inner loop
      ret += options.fn({ outerIndex: i });
  }

  return ret;
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



const port = process.env.PORT | 8080;
server.listen(port, function(){
    console.log('Listening at port '+port);
    console.log('Wait for database connection, else it will crash.');
});
