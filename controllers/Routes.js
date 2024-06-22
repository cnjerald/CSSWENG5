const { timeEnd, info } = require('console');
const responder = require('../models/Responder');
const fs = require('fs');
const session = require('express-session');
//schemas
const personalInfoModel = require('../models/personalInfo')

const multer = require('multer');
// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the destination folder
  },
  filename: (req, file, cb) => {
    // Preserve the original file name
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });
function add(server) {
  server.use(session({
    secret: '09175019182', // Pls do not call this number. will change to a hash soon.
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

  // For bug testers, param2 can be changed to 60000 (or 1 minuites for bug testing) 
  // See documentation of this function on Responder.js file.
  setInterval(responder.checkOneMonth, 60* 60 * 1000);

  // Login as index
  server.get('/', function(req, resp) {
    resp.render('login', {
      layout: 'loginIndex',
      title: 'login',
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

  server.get('/mainpage', function(req, resp) {
    responder.getMembers().then(memberData => {
      resp.render('mainpage', {
        layout: 'mainMenuIndex',
        title: 'temp',
        member: memberData,
      });
    });
  });

    // POST endpoint to handle file upload
  server.post('/upload/image', upload.single('imageFile'), (req, res) => {
    // 'imageFile' should match the name attribute in the FormData object

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Handle the uploaded file, e.g., save it to a directory, store its path in a database, etc.
    const filePath = req.file.path;
    req.session.profilePicturePath = filePath;
    console.log("C1"+filePath);
    
    // Respond with JSON indicating success
    res.json({ message: 'File uploaded successfully', filePath: filePath });
  });

  server.get('/memberDetail', function(req, resp) {
    const uicCode = req.query.uic_code; // extract uic_code from query parameters

    responder.getMembers().then(memberData => {
        // find the member in memberData array based on uic_code
        const member = memberData.find(member => member.uic_code === uicCode);

        if (member) {
            resp.render('memberdetail', {
                layout: 'memberDetailsIndex',
                title: 'Member Detail',
                member: member
            });
        } else {
            resp.status(404).send('Member not found'); //  member not found case
        }
    }).catch(error => {
        resp.status(500).send('Error fetching members'); // handle error case
    });
  }); 


  server.post('/register-checker', function(req, resp) {
    // new instance of model to update
    const newPersonalInfo = new personalInfoModel({
      uic_code: req.body.uic_code,
      img_path: req.session.profilePicturePath,
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
      entries: req.body.entries,
      medications: req.body.medications,
      conditions: req.body.conditions,
      ePerson: req.body.ePerson,
      eContact: req.body.eContact,
      eRelationship: req.body.eRelationship,
      eAddress: req.body.eAddress,
      comments: req.body.comments,
    });

    responder.checkPersonalInfo(newPersonalInfo).then((arr)=>{
      let pass = 0;
      arr.every(function(element){
        if (element !== 1) {
          pass = 1;
          return false; // exit the loop early if any element is not 1
        }
        return true;
      });
      console.log(pass);
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

  server.post("/filter_ajax",function(req,resp){
    var membership = req.body.membership;
    var payment = req.body.payment;
    var sex = req.body.sex;
    var searchRes = req.body.searchRes;

    responder.searchFilter(searchRes,sex).then((members)=>{
      resp.send({members: members});
    })
    
    

  });

  



  server.post('/login-checker', function(req, resp) {
 
    let userEmail = req.body.username;
    let userPassword = req.body.password;
    console.log(userEmail);
    console.log(userPassword);
    req.session.curUserMail = req.body.email;

    responder.getUser(userEmail, userPassword)
    .then(user => {
        if (user != null){
            resp.redirect('/mainpage');
        } else {
          resp.render('login', {
            layout: 'loginIndex',
            title: 'login'
          });
        }             
    })
    .catch(error => {
        console.error(error);
    });

});


  server.get('/mainmenu', function(req, resp) {
    resp.render('mainpage', {
      layout: 'mainpageIndex',
      title: 'mainpage'
    });
  });


  server.post('/membership_request',function(req,resp){
    responder.checkMembershipStatus(req.body.input).then(args =>{
      if(args != undefined){
        resp.send({name: args.name, memberUntil: args.memberUntil})
      } else{
        console.log("Who are you?");
      }


    })
 


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
          console.log("Debugger" + req.body.uic);
          if(args.status == 'paid'){
            responder.updateMembershipStatus(req.body.uic);
          } 
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
