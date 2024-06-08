const { timeEnd, info } = require('console');
const responder = require('../models/Responder');
const fs = require('fs');
const session = require('express-session');

function add(server) {
  server.use(session({
    secret: '09175019182', // Pls do not call this number. will change to a hash soon.
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

  // Login as index
  server.get('/', function(req, resp) {
    resp.render('login', {
      layout: 'loginIndex',
      title: 'login'
    });
  });

  server.get('/register', function(req, resp) {
    resp.render('personalInfoForm', {
      layout: 'formIndex',
      title: 'test'
    });
  });

  server.post('/register-checker',function(req,resp){
    // These are sample printers on each entries.
    console.log(req.body.uic1 + req.body.uic2 + req.body.uic3 + req.body.uic4);
    console.log(req.body.lname);
    console.log(req.body.mname);
    console.log(req.body.fname);
    console.log(req.body.gender);
    console.log(req.body.sex);
    console.log(req.body.bday);
    console.log(req.body.contact_number);
    console.log(req.body.email_address);
    console.log(req.body.facebook_address);
    console.log(req.body.civil_status);
    console.log(req.body.citizenship);
    console.log(req.body.occupation);
    console.log(req.body.designation);
    console.log(req.body.company);
    console.log(req.body.educationEntries);
    console.log(req.body.ePerson);
    console.log(req.body.eContact);
    console.log(req.body.eRelationship);
    console.log(req.body.eAddress);
    console.log(req.body.comments);

    // Todo:

  /*
    if responder.validEntries()
        PUSH TO DATABASE
    else
      SEND AJAX, ERROR ENTRIES


  */

 


  });

  

  server.post('/login-checker', function(req, resp) {
    resp.redirect('/mainMenu');
  });


  server.get('/mainmenu', function(req, resp) {
    resp.render('mainpage', {
      layout: 'mainpageIndex',
      title: 'mainpage'
    });
  });









  // Ajax payment_request
  server.post('/payment_request', function(req, resp) {
    if (req.body.input == '100') {
      // Confirm receive request
      console.log("Received request");
      // GetLink
      responder.getPaymentLink().then(args => {
        // Store paymentID in session
        req.session.paymentID = args.paymentID;
        // Send link to webpage Async
        resp.send({ link: args.link });
      }).catch(error => {
        console.error("Error in getPaymentLink: ", error);
        resp.status(500).send({ error: 'Internal Server Error' });
      });
    } else {
      resp.status(400).send({ error: 'Invalid input' });
    }
  });

  // Ajax check_payment_status
  server.post('/payment_checker', function(req, resp) {
    if (req.body.input == '200') {
      if (req.session.paymentID != null) {
        // Confirm receive request
        console.log("Received check request");
        // Send to responder to check status
        responder.checkPayment(req.session.paymentID).then(args => {
          // Update async status
          resp.send({ paymentStatus: args.status });
        }).catch(error => {
          console.error("Error in checkPayment: ", error);
          resp.status(500).send({ error: 'Internal Server Error' });
        });
      } else {
        resp.status(400).send({ error: 'Payment ID is not set' });
      }
    } else {
      resp.status(400).send({ error: 'Invalid input' });
    }
  });

  // Use of Function from Responder.
  responder.sampleFunction("Passed Parameter: Hello World").then(output => {
    console.log(output);
  }).catch(error => {
    console.error("Error in sampleFunction: ", error);
  });
}

module.exports.add = add;
