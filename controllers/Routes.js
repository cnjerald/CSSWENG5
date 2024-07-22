const { timeEnd, info } = require('console');
const responder = require('../models/Responder');
const fs = require('fs');
const session = require('express-session');
//schemas
const personalInfoModel = require('../models/personalInfo')
const eventsModel = require("../models/eventsInfo");
const paymentModel = require("../models/paymentInfo");
const donationModel = require("../models/donationsInfo");

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

const isAuth = (req, res, next) => {
  if(req.session.isAuth){
      next();
  }else{
      res.redirect('/');  
  }
}

const isAuthLogin = (req, res, next) => {
  if(req.session.isAuth){
      res.redirect('/mainpage');
  }else{
      next();
  }
}

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
  server.get('/', isAuthLogin, function(req, resp) {
    resp.render('login', {
      layout: 'loginIndex',
      title: 'login',
    });
  });

  // Logout.
  server.get('/logout', function (req, resp) {
      req.session.curUserData = null;
    
    req.session.destroy((err) => {
        if(err) throw err;
        resp.redirect('/');
    });
  });

  // Registration page
  server.get('/renew', isAuth, async function(req, resp) {
    try {
        const payments = await paymentModel.find({}).lean();
        const groupedPayments = responder.groupByDate(payments);

        resp.render('renewPage', {
            layout: 'renewIndex',
            title: 'Renew',
            renewals: groupedPayments
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        resp.status(500).send("Internal Server Error");
    }
});

  // Registration page
  server.get('/register',isAuth, function(req, resp) {
    req.session.profilePicturePath = null; // Reset the session variable
    req.session.signiturePath = null;
    resp.render('personalInfoForm', {
        layout: 'formIndex',
        title: 'Register'
    });
  });

  // Admin main page
  server.get('/mainpage', isAuth, function(req, resp) {
    // Call checkMembershipStatus and wait for it to complete
    responder.checkMembershipStatus()
      .then(() => {
        // Fetch member data after the membership status check is complete
        return responder.getMembers();
      })
      .then(memberData => {
        // Render the page with member data
        resp.render('mainpage', {
          layout: 'mainMenuIndex',
          title: 'Mainpage',
          member: memberData,
        });
      })
      .catch(err => {
        // Handle any errors that occurred in checkMembershipStatus or getMembers
        console.error('Error in /mainpage route:', err);
        resp.status(500).send('Internal Server Error');
      });
  });
  // Events page
  server.get('/events',isAuth, function(req,resp){
    responder.getEvents().then(eventData =>{
      resp.render('events',{
        layout: 'eventIndex',
        title: 'Events',
        event: eventData
      })
    })
  })

  // Donations Page

  server.get('/donations', isAuth, async function(req, resp) {
    try {
        const donations = await donationModel.find({}).lean();
        const groupedDonations = responder.groupByDateDonations(donations);
        console.log(groupedDonations);
        resp.render('donations', {
            layout: 'donationsIndex',
            title: 'donations',
            renewals: groupedDonations
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        resp.status(500).send("Internal Server Error");
    }
  });

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

  server.get('/memberDetail',isAuth, function(req, resp) {
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

  server.get('/new_updateMember',isAuth, function(req, resp) {
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

            if (newPersonalInfo.renewalDate) {
              const today = new Date(); // Get today's date
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
              const day = String(today.getDate()).padStart(2, '0');
              const hours = String(today.getHours()).padStart(2, '0');
              const minutes = String(today.getMinutes()).padStart(2, '0');
              const seconds = String(today.getSeconds()).padStart(2, '0');

              const formattedDate = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;

            
              const paymentInfo = new paymentModel({
                admin: req.session.curUserMail,
                date_created: formattedDate,
                user: newPersonalInfo._id,
                new_renewalDate: newPersonalInfo.renewalDate
              });
            
              // Save paymentInfo first, then save newPersonalInfo
              paymentInfo.save()
                .then(() => {
                  return newPersonalInfo.save();
                })
                .then(() => {
                  console.log('Payment and personal info saved successfully.');
                  // Add any further processing or response handling here
                })
                .catch(err => {
                  console.error('Error saving payment info or personal info:', err);
                  // Handle error response here, e.g., send an error response to the client
                  resp.status(500).send('Internal Server Error');
                });
            }

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
    
    req.session.curUserMail = userEmail;

    responder.getUser(userEmail, userPassword)
    .then(user => {
        if (user != null){
          
          req.session.isAuth = true;
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



  // Get event participants.
  server.post('/event_ajax', function(req, resp) {
    const arr = [];
    console.log("TEST1!" + req.body._id);


    responder.getEventDetails(req.body._id).then(event => {
        responder.getMembers().then(members => {
            members.forEach(member => {
              const memberIdStr = member._id.toString(); // Convert ObjectId to string
                if (!event.participants.includes(memberIdStr)) {
                    // If not, push to arr
                    console.log("This member is included.");
                    arr.push(member);
                }
            });
            arr.forEach(test=>{
              console.log("AAAAAA" + test._id);
            })
            responder.getRegisteredMembers(event._id).then(registeredMembers =>{
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
    responder.registerMemberToEvent(req.body._id, req.body.attendeeName).then(event => {
        return responder.getEventDetails(req.body._id).then(eventDetails => {
            return responder.getMembers().then(members => {
                const arr = members.filter(member => {
                    const memberIdStr = member._id.toString(); // Convert ObjectId to string
                    return !eventDetails.participants.includes(memberIdStr);
                });
                return { arr, eventDetails };
            });
        });
    }).then(({ arr, eventDetails }) => {
        console.log("continue " + arr);
        return responder.getRegisteredMembers(req.body._id).then(members => {
            resp.send({ registeredMembers: members, members: arr });
        });
    }).catch(err => {
        console.error("Err", err);
        resp.status(500).send("Internal Server Error");
    });
  });


  server.post('/ajax_getRegisteredMembership', function(req,resp){
    responder.getRegisteredmembership().then(members=>{
      resp.send({members: members});
    }).catch(err =>{
      console.error("Err",err);
      resp.status(500).send("Internal Server Error");
    })
  })




  server.post('/ajax_querySelectedMembership',function(req,resp){
    responder.querySelectedMembership(req.body.name,req.body.uic).then(transactions =>{
      resp.send({transactions});
    }).catch(err=>{
      console.error("Err",err);
      resp.status(500).send("Internal Server Error");
    })
  })

  server.post('/addPayment_ajax',function(req,resp){


    responder.getUserID(req.body.name,req.body.uic).then(id=>{
      if (id){
        const today = new Date(); // Get today's date
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');
    
        const formattedDate = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
  
        let newPayment = new paymentModel({
          admin: req.session.curUserMail,
          date_created: formattedDate,
          user: id,
          new_renewalDate: req.body.paymentDate
        })
        newPayment.save();

        responder.querySelectedMembership(req.body.name,req.body.uic).then(transactions =>{

          if (transactions.length > 0) {
            const firstTransaction = transactions[0]['new_renewalDate'];
            responder.updateMembershipRecord(id,firstTransaction);
          } 
          responder.checkMembershipStatus().then(()=>{
            resp.send({transactions});
          })
          
          
        }).catch(err=>{
          console.error("Err",err);
          resp.status(500).send("Internal Server Error");
        })
      }
    });
  })

  server.post('/deletePayment_ajax',function(req,resp){
    responder.deletePayment_ajax(req.body.id);
    
    responder.getUserID(req.body.name,req.body.uic).then(id=>{
      responder.querySelectedMembership(req.body.name,req.body.uic).then(transactions =>{

        if (transactions.length > 0) {
          const firstTransaction = transactions[0]['new_renewalDate'];
          responder.updateMembershipRecord(id,firstTransaction);
        } 
        responder.checkMembershipStatus().then(()=>{
          resp.send({transactions});
        })
      }).catch(err=>{
        console.error("Err",err);
        resp.status(500).send("Internal Server Error");
      })
      
    })

  });

  server.post('/ajax_getAllMembers', function(req,resp){
    responder.getMembers().then(members=>{
      resp.send({members: members});
    }).catch(err =>{
      console.error("Err",err);
      resp.status(500).send("Internal Server Error");
    })
  })

  server.post('/ajax_queryMemberDonations',function(req,resp){
    responder.queryDonations(req.body.name,req.body.uic).then(donations =>{
      resp.send({donations});
    }).catch(err=>{
      console.error("Err",err);
      resp.status(500).send("Internal Server Error");
    })
  })

  
  server.post('/addDonation_ajax',function(req,resp){


    responder.getUserID(req.body.name,req.body.uic).then(id=>{
      if (id){
        const today = new Date(); // Get today's date
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');
    
        const formattedDate = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
  
        let newDonation = new donationModel({
          admin: req.session.curUserMail,
          date_created: formattedDate,
          user: id,
          amount: parseFloat(req.body.donationAmount)
        });
        newDonation.save();

        responder.queryDonations(req.body.name,req.body.uic).then(donations=>{
          resp.send({donations})

        }).catch(err=>{
          console.error("Err",err);
          resp.status(500).send("Internal Server Error");
        })
      }
    });
  })

  
  server.post('/deleteDonation_ajax',function(req,resp){
    responder.deleteDonation_ajax(req.body.id);
    responder.queryDonations(req.body.name,req.body.uic).then(donations=>{
      resp.send({donations})
    }).catch(err=>{
      console.error("Err",err);
      resp.status(500).send("Internal Server Error");
    })
  });
   


  
}

module.exports.add = add;
