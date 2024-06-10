const { timeEnd, info } = require('console');
const responder = require('../models/Responder');
const fs = require('fs');
const session = require('express-session');
//schemas
const personalInfoModel = require('../models/personalInfo')

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

  server.get('/payment', function(req, resp) {
    resp.render('payment', {
      layout: 'paymentIndex',
      title: 'test'
    });
  });

  server.post('/register-checker', function(req, resp) {
    // new instance of model to update
    const newPersonalInfo = new personalInfoModel({
      uic_code: req.body.uic_code,
      uic1: req.body.uic1,
      uic2: req.body.uic2,
      uic3: req.body.uic3,
      uic4: req.body.uic4,
      last_name: req.body.lname,
      middle_name: req.body.mname,
      first_name: req.body.fname,
      gender: req.body.gender,
      sex: req.body.sex,
      birthday: req.body.bday,
      contact_number: req.body.contact_number,
      email: req.body.email_address,
      fb_account: req.body.facebook_address,
      civil_status: req.body.civil_status,
      citizenship: req.body.citizenship,
      occupation: req.body.occupation,
      designation: req.body.designation,
      company: req.body.company,
    });

    console.log(req.body.medications);
    console.log(req.body.conditions);

    responder.checkPersonalInfo(newPersonalInfo).then((arr)=>{
      let pass = 0;
      arr.every(function(element){
        if (element !== 1) {
          pass = 1;
          return false; // exit the loop early if any element is not 1
        }
        return true;
      });
      
      if (pass === 0){
        newPersonalInfo.save()
          .then(() => {
            console.log('personal info created');
            resp.send({msg:'Data saved successfully'});
            
          })
          .catch((error) => {
            console.error('Error saving data: ', error);
            resp.status(500).send('Internal Server Error');
          });
      } else {
        resp.send({arr: arr});
      }


    })

    
    // save the new instance to the database

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
