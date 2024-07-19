const { timeEnd, info } = require('console');
const responder = require('../models/Responder');
const fs = require('fs');
const session = require('express-session');
//schemas
const personalInfoModel = require('../models/personalInfo')
const eventsModel = require("../models/eventsInfo");

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

  // These section contains all get request for the pages.

  // Login as index
  server.get('/', function(req, resp) {
    resp.render('login', {
      layout: 'loginIndex',
      title: 'login',
    });
  });
  // Registration page
  server.get('/register', function(req, resp) {
    req.session.profilePicturePath = null; // Reset the session variable
    req.session.signiturePath = null;
    resp.render('personalInfoForm', {
        layout: 'formIndex',
        title: 'test'
    });
});
  // Payment page
  server.get('/payment', function(req, resp) {
    resp.render('payment', {
      layout: 'paymentIndex',
      title: 'test'
    });
  });
  // Admin main page
  server.get('/mainpage', function(req, resp) {
    responder.getMembers().then(memberData => {
      resp.render('mainpage', {
        layout: 'mainMenuIndex',
        title: 'temp',
        member: memberData,
      });
    });
  });
  // Events page
  server.get('/events',function(req,resp){
    responder.getEvents().then(eventData =>{
      resp.render('events',{
        layout: 'eventIndex',
        title: 'Events',
        event: eventData
      })
    })
  })

  //This section contains ajax requests

  /**
   * This ajax request creates a new event given by the admin.
   * 
   */
  server.post('/api/add-event', async (req, res) => {
    const { eventName, eventDate } = req.body;

    try {
        const eventInfo = new eventsModel({
            name: eventName,
            date: eventDate,
            attendees: 0,
            attendeeCodes: []
        });

        await eventInfo.save();
        console.log("Event added");
        res.status(200).json({
            message: 'Event added successfully!',
            event: { eventName, eventDate }
        });
    } catch (err) {
        console.error('Error adding event:', err);
        res.status(500).json({ message: 'Failed to add event' });
    }
});
  /**
   * This ajax request handles the uploading of profile picture during registration.
   */
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

  server.post('/upload/cancel', (req, res) => {
    const filePath = req.session.profilePicturePath;
  
    if (filePath) {
      // Delete the file from the server
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ error: 'Error deleting file' });
        }
  
        // Update the session
        req.session.profilePicturePath = null;
        res.json({ message: 'Upload canceled and file deleted' });
      });
    } else {
      res.status(400).json({ error: 'No file to delete' });
    }
  });

  server.post('/upload/imageSigniture', upload.single('imageFileSigniture'), (req, res) => {
    // 'imageFile' should match the name attribute in the FormData object

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
        
    }
    // Handle the uploaded file, e.g., save it to a directory, store its path in a database, etc.
    const filePath = req.file.path;
    req.session.signiturePath = filePath;
    console.log("C1"+filePath);
    
    // Respond with JSON indicating success
    res.json({ message: 'File uploaded successfully', signiturePath: filePath });
  });

  server.post('/upload/cancelSigniture', (req, res) => {
    const filePath = req.session.signiturePath;
  
    if (filePath) {
      // Delete the file from the server
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ error: 'Error deleting file' });
        }
  
        // Update the session
        req.session.profilePicturePath = null;
        res.json({ message: 'Upload canceled and file deleted' });
      });
    } else {
      res.status(400).json({ error: 'No file to delete' });
    }
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

  server.get('/new_updateMember', function(req, resp) {
    const uicCode = req.query.uic_code; // extract uic_code from query parameters

    responder.getMembers().then(memberData => {
        // find the member in memberData array based on uic_code
        const member = memberData.find(member => member.uic_code === uicCode);

        if (member) {
            resp.render('new_updateMember', {
                layout: 'memberDetailsIndex',
                title: 'updateMember',
                member: member
            });
        } else {
            resp.status(404).send('Member not found'); //  member not found case
        }
    }).catch(error => {
        resp.status(500).send('Error fetching members'); // handle error case
    });
  }); 

  server.post('/update-member', (req, res) => {
    const { uic_code, name, birthday, barangay, location, gender, sex, contact_number, email, civil_status, fb_account, occupation, designation, company, entries, medications, ePerson, eContact, eRelationship, eAddress } = req.body;

    // Assuming `uic_code` uniquely identifies the member to update
    personalInfoModel.findOneAndUpdate({ uic_code: uic_code }, {
        name: name,
        birthday: birthday,
        barangay: barangay,
        location: location,
        gender: gender,
        sex: sex,
        contact_number: contact_number,
        email: email,
        civil_status: civil_status,
        fb_account: fb_account,
        occupation: occupation,
        designation: designation,
        company: company,
        entries: entries,
        medications: medications,
        ePerson: ePerson,
        eContact: eContact,
        eRelationship: eRelationship,
        eAddress: eAddress
    }, { new: true })
    .then(updatedMember => {
        if (!updatedMember) {
            return res.status(404).json({ message: 'Member not found' });
        }
        console.log('Member details updated:', updatedMember);
        res.status(200).json({ message: 'Member details updated successfully', member: updatedMember });
    })
    .catch(error => {
        console.error('Error updating member details:', error);
        res.status(500).json({ message: 'Failed to update member details' });
    });
});

  // DELETE route to delete a member based on uic_code
  server.delete('/delete-member', (req, res) => {
    const uic_code = req.body;

    personalInfoModel.findOneAndDelete(uic_code)
        .then(deletedMember => {
            if (!deletedMember) {
                return res.status(404).json({ message: 'Member not found' });
            }
            console.log('Member deleted:', deletedMember);
            res.status(200).json({ message: 'Member deleted successfully' });
        })
        .catch(error => {
            console.error('Error deleting member:', error);
            res.status(500).json({ message: 'Failed to delete member' });
        });
    });

  /**
   * This ajax request checks if the input during registration is valid or not.
   */

  server.post('/register-checker', function(req, resp) {
    // new instance of model to update
    console.log("Check" + req.body.renewalDate);
    const newPersonalInfo = new personalInfoModel({
      uic_code: req.body.uic_code,
      img_path: req.session.profilePicturePath,
      sig_path: req.session.signiturePath,
      name : req.body.lname + " " + req.body.fname + " " + req.body.mname,
      gender: req.body.gender,
      sex: req.body.sex,
      keyPopulation: req.body.keyPopulation,
      birthday: req.body.bday,
      contact_number: req.body.contact_number,
      email: req.body.email_address,
      fb_account: req.body.facebook_address,
      barangay: req.body.barangay,
      location: req.body.location,
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
      membership: req.body.membership,
      membershipDetails: req.body.membershipDetails,
      comments: req.body.comments,
      renewalDate: req.body.renewalDate
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

  /**
   * This ajax request is in charge for search filters on the mainpage.
   */
  server.post("/filter_ajax",function(req,resp){
    var sex = req.body.sex;
    var membership = req.body.membership;
    var membershipDetails = req.body.membershipDetails;
    var sort = req.body.sort
    var searchRes = req.body.searchRes;

    responder.searchFilter(searchRes,sex,membership,membershipDetails,sort).then((members)=>{
      resp.send({members: members});
    })
    
  });
  /**
   * This ajax request checks if the login details of (ADMIN) is valid or not.
   */

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

  /**
   * This ajax request queries the name and membership status of a member.
   */

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

  // Get event participants.
  server.post('/event_ajax', function(req, resp) {
    const arr = [];
    console.log("TEST1!" + req.body._id);
    console.log("TEST2!" + req.body.eventName);
    
    responder.getEventDetails(req.body.eventName).then(event => {
        console.log("EventMembers: " + event.participants);
        console.log("Parti: " + event.attendees);

        responder.getMembers().then(members => {
            members.forEach(member => {
                if (!event.participants.includes(member.name)) {
                    // If not, push to arr
                    arr.push(member);
                }
            });
            responder.getRegisteredMembers(event.name).then(registeredMembers =>{
              resp.send({ members: arr ,registeredMembers : registeredMembers});
            })

        }).catch(err => {
            console.error('Error getting members:', err);
            resp.status(500).send('Internal Server Error');
        });
    }).catch(err => {
        console.error('Error getting event details:', err);
        resp.status(500).send('Internal Server Error');
    });
  });

  // Ajax add users to event

  server.post('/event_user_ajax', function(req, resp) {
    responder.registerMemberToEvent(req.body.eventName, req.body.attendeeName).then(event => {
        return responder.getEventDetails(req.body.eventName).then(eventDetails => {
            return responder.getMembers().then(members => {
                const arr = members.filter(member => !eventDetails.participants.includes(member.name));
                return { arr, eventDetails };
            });
        });
    }).then(({ arr, eventDetails }) => {
        console.log("continue " + arr);
        return responder.getRegisteredMembers(eventDetails.name).then(members => {
            resp.send({ registeredMembers: members, members: arr });
        });
    }).catch(err => {
        console.error("Err", err);
        resp.status(500).send("Internal Server Error");
    });
  });
}

module.exports.add = add;
