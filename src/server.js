//Express Framework to write apis
const express = require('express');
//To avoid issues when you run fe and be in same system
const cors = require('cors');
//firbase config details to connect with firebase application
const myConfig = require('./config/firebase-config');
//To bycrypt password
const bcrypt = require('bcrypt');
//number of rounds of bycryption
const saltRounds = 10;
//to create and manage token to shar it to frontend for durther actions.
const jwt = require('jsonwebtoken');
//service account from firebase which need to be keep it secure
const serviceAccount = require('./config/serviceAccountKey.json');
;
//To send mail from node
const nodemailer = require('nodemailer');

//Uploading files
//Filetype Checking Util.( https://github.com/wibawaarif/firebase_storage_example/blob/main/middleware/multer.js)
function checkFileType(file, cb) {

  // Allowed ext
  const fileTypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Images Only !!!");
  }
}
//o handle file uploads
const multer = require('multer');

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

//The body-parser middleware is used to parse JSON request bodies.
const bodyParser = require('body-parser');
// const middleware = require('./middleware');

const app = express();
const port = 8002;
app.use(bodyParser.json());
app.use(cors());
//
app.use(express.urlencoded({ extended: true }))

//express-session middleware is responsible for managing user sessions
// app.use(
//   session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
//   })
// );

//it checks weather user is authenticated by examining the req.session.loggedIn property.
// const checkAuthentication = (req, res, next) => {
//   if (req.session.loggedIn) {
//     next();
//   } else {
//     res.status(401).send('Unauthorized');
//   }
// };

// app.use(middleware.decodeToken);

// Middleware for verifying JWT
function verifyToken(req, res, next) {
  debugger
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, 'mykeyfornow', (err, decoded) => {
    if (err) {
      debugger
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
}

// Create a reference to the Firebase database
const db = myConfig.admin.database();

//Endpoint to create Employer Signup
app.post('/signup', async (req, res) => {
  const {
    companyName,
    companyURL,
    stageOfStartup,
    funded,
    fundingDetails,
    aboutCompany,
    email,
    address,
    phoneNumber,
    password,
  } = req.body;
  debugger
  try {

    if (
      !companyName ||
      !companyURL ||
      !stageOfStartup ||
      funded === undefined ||
      !aboutCompany ||
      !email ||
      !address ||
      !phoneNumber ||
      !password
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const userRecord = await myConfig.admin.auth().createUser({
      email: email,
      password: password
    });
    const token = jwt.sign({ uid: userRecord.uid }, 'mykeyfornow', { expiresIn: '1h' });
    // Store additional user data in the database
    const employersRef = db.ref('employers');

    // Generate a new key for the employer
    const newEmployerRef = employersRef.push();

    // Create the employer object with a unique employer ID
    const employer = {
      employerId: newEmployerRef.key,
      companyName,
      companyURL,
      stageOfStartup,
      funded,
      fundingDetails,
      aboutCompany,
      email,
      address,
      phoneNumber,
    };
    // Save the employer information to Firebase
    newEmployerRef.set(employer);

    res.status(201).json({ token });
  }
  catch (error) {
    res.json(error)
  }

})

// Endpoint for updating employer profile 
app.put('/update-profile/:employerId', (req, res) => {
  try {
    const employerId = req.params.employerId;
    const {
      companyName,
      companyURL,
      stageOfStartup,
      funded,
      fundingDetails,
      aboutCompany,
      email,
      address,
      phoneNumber,
    } = req.body;

    if (
      !companyName &&
      !companyURL &&
      !stageOfStartup &&
      funded === undefined &&
      !aboutCompany &&
      !email &&
      !address &&
      !phoneNumber
    ) {
      return res.status(400).json({ error: 'No fields provided for the update' });
    }

    // Create a reference to the Firebase database for employer profiles
    const employersRef = db.ref('employers').child(employerId);

    // Fetch the existing employer profile
    employersRef.once('value', (snapshot) => {
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Employer profile not found' });
      }

      const existingEmployer = snapshot.val();

      // Update the fields provided in the request
      if (companyName) existingEmployer.companyName = companyName;
      if (companyURL) existingEmployer.companyURL = companyURL;
      if (stageOfStartup) existingEmployer.stageOfStartup = stageOfStartup;
      if (funded !== undefined) existingEmployer.funded = funded;
      if (fundingDetails) existingEmployer.fundingDetails = fundingDetails;
      if (aboutCompany) existingEmployer.aboutCompany = aboutCompany;
      if (email) existingEmployer.email = email;
      if (address) existingEmployer.address = address;
      if (phoneNumber) existingEmployer.phoneNumber = phoneNumber;

      // Save the updated employer profile back to Firebase
      employersRef.update(existingEmployer);

      res.status(200).json({ message: 'Employer profile updated successfully' });
    });
  } catch (error) {
    console.error('Error updating employer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Sign In Employer and Job seeker
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  debugger
  try {
    const userRecord = await myConfig.admin.auth().getUserByEmail(email);
    // Attempt to sign in with the provided email and password
    await myConfig.admin.auth().updateUser(userRecord.uid, {
      password, // Provide the user's password
    });
    //// If authenticated, set the user data in the session
    // req.session.loggedIn = true;
    // req.session.employerID = 'your-user-id'; 
    // You can also fetch user profile data from Firebase and store it in the session here

    const token = jwt.sign({ uid: userRecord.uid }, 'mykeyfornow', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});


// Endpoint for posting job entries
/*
The /job-entries route is used for posting a job entry. It first checks if the user is authenticated using 
the checkAuthentication middleware.If authenticated, it retrieves the user's ID from the session (req.session.employerID).*/
app.post('/job-entries',(req, res) => {
  debugger
  try {
    // Validate the request body
    const { roleName, responsibilities, skills, openings, workMode, extraMessage } = req.body;

    const employerID = "-NhtmAloig-GFGEQkC5s"; // Extract the employerID from the authenticated user's JWT

    if (!roleName || !responsibilities || !skills || !openings || !workMode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a reference to the Firebase database
    const jobEntriesRef = db.ref('job-entries');

    // Generate a new key for the job entry
    const newJobEntryRef = jobEntriesRef.push();

    // Create the job entry object
    const jobEntry = {
      jobId: newJobEntryRef.key,
      employerID: employerID,
      roleName,
      responsibilities,
      skills,
      openings,
      workMode,
      extraMessage,
    };
    // Save the job entry to Firebase
    newJobEntryRef.set(jobEntry);

    res.status(201).json({ message: 'Job entry posted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Endpoint for updating a specific job entry
app.put('/job-entries/:jobId', (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { roleName, responsibilities, skills, openings, workMode, extraMessage } = req.body;

    if (!roleName && !responsibilities && !skills && !openings && !workMode && !extraMessage) {
      return res.status(400).json({ error: 'At least one field is required for the update' });
    }

    // Create a reference to the Firebase database
    const jobEntriesRef = db.ref('job-entries').child(jobId);

    // Fetch the existing job entry
    jobEntriesRef.once('value', (snapshot) => {
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Job entry not found' });
      }

      const existingJobEntry = snapshot.val();

      // Update the fields provided in the request
      if (roleName) existingJobEntry.roleName = roleName;
      if (responsibilities) existingJobEntry.responsibilities = responsibilities;
      if (skills) existingJobEntry.skills = skills;
      if (openings) existingJobEntry.openings = openings;
      if (workMode) existingJobEntry.workMode = workMode;
      if (extraMessage) existingJobEntry.extraMessage = extraMessage;

      // Save the updated job entry back to Firebase
      jobEntriesRef.update(existingJobEntry);

      res.status(200).json({ message: 'Job entry updated successfully' });
    });
  } catch (error) {
    console.error('Error updating job entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//End point to retrive all jobs posted by an Employer
app.get('/jobs', verifyToken,async (req, res) => {
  debugger
  const employerID = "-NhtmAloig-GFGEQkC5s"; // Extract the employerID from the authenticated user's JWT

  try {
    const ref = db.ref('job-entries');
    const snapshot = await ref.orderByChild('employerID').equalTo(employerID).once('value');
    if (snapshot.exists()) {
      const jobs = snapshot.val();
      res.status(200).json(jobs);
    } else {
      res.status(404).json({ message: 'No jobs found for this employer.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching jobs.' });
  }
});

//End Point to Signup Jobseeker
app.post('/signupjobseekers', upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res) => {
    // Get user data from the request
    debugger
    const {
      firstname,
      lastname,
      email,
      password,
    } = req.body;
    try {

      if (
        !firstname ||
        !lastname ||
        !email ||
        !password
      ) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      const profilePhotoFile = req.files['profilePhoto'][0];
    const resumeFile = req.files['resume'][0];

    // Create a unique filename for the profile photo and resume
    const profilePhotoFileName = `profile_photos/${Date.now()}_${profilePhotoFile.originalname}`;
    const resumeFileName = `resumes/${Date.now()}_${resumeFile.originalname}`;

    // Upload profile photo and resume to Firebase Storage
    const profilePhotoUpload = myConfig.admin.storage().bucket().file(profilePhotoFileName);
    const resumeUpload = myConfig.admin.storage().bucket().file(resumeFileName);

    await profilePhotoUpload.save(profilePhotoFile.buffer);
    await resumeUpload.save(resumeFile.buffer);


      const userRecord = await myConfig.admin.auth().createUser({
        email: email,
        password: password
      });
      const token = jwt.sign({ uid: userRecord.uid }, 'mykeyfornow', { expiresIn: '1h' });
      // Store additional user data in the database
      const jobseekersRef = db.ref('jobseekers');
  
      // Generate a new key for the employer
      const newJobseekersRef = jobseekersRef.push();
  
      // Create the employer object with a unique employer ID
      const jobseeker = {
        jobseekerId: newJobseekersRef.key,
        firstname,
        lastname,
        email,
        password,
        profilePhotoURL: `https://storage.googleapis.com/your-storage-bucket-url/${profilePhotoFileName}`,
        resumeURL: `https://storage.googleapis.com/your-storage-bucket-url/${resumeFileName}`
      };
      // Save the employer information to Firebase
      newJobseekersRef.set(jobseeker);
  
      res.status(201).json({ token });
    }
    catch (error) {
      res.json(error)
    }
});

// Endpoint for updating job seeker profile yet to test
app.put('/update-jobseeker-profile/:jobseekerId', upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), (req, res) => {
  debugger
  try {
    const jobseekerId = req.params.jobseekerId;
    const {
      firstname,
      lastname,
      email,
      password,
    } = req.body;

    if (
      !firstname &&
      !lastname &&
      !email &&
      !password
    ) {
      return res.status(400).json({ error: 'No fields provided for the update' });
    }

    // Create a reference to the Firebase database for job seekers
    const jobseekersRef = db.ref('jobseekers').child(jobseekerId);

    // Fetch the existing job seeker profile
    jobseekersRef.once('value', async (snapshot) => {
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Job seeker profile not found' });
      }

      const existingJobSeeker = snapshot.val();

      // Update the fields provided in the request
      if (firstname) existingJobSeeker.firstname = firstname;
      if (lastname) existingJobSeeker.lastname = lastname;
      if (email) existingJobSeeker.email = email;
      if (password) {
        // Update password for Firebase Authentication
        await myConfig.admin.auth().updateUser(existingJobSeeker.uid, { password });
      }

      // Upload new profile photo and resume, if provided
      if (req.files['profilePhoto']) {
        const profilePhotoFile = req.files['profilePhoto'][0];
        const profilePhotoFileName = `profile_photos/${Date.now()}_${profilePhotoFile.originalname}`;
        const profilePhotoUpload = myConfig.admin.storage().bucket().file(profilePhotoFileName);
        await profilePhotoUpload.save(profilePhotoFile.buffer);
        existingJobSeeker.profilePhotoURL = `https://storage.googleapis.com/your-storage-bucket-url/${profilePhotoFileName}`;
      }

      if (req.files['resume']) {
        const resumeFile = req.files['resume'][0];
        const resumeFileName = `resumes/${Date.now()}_${resumeFile.originalname}`;
        const resumeUpload = myConfig.admin.storage().bucket().file(resumeFileName);
        await resumeUpload.save(resumeFile.buffer);
        existingJobSeeker.resumeURL = `https://storage.googleapis.com/your-storage-bucket-url/${resumeFileName}`;
      }

      // Save the updated job seeker profile back to Firebase
      jobseekersRef.update(existingJobSeeker);

      res.status(200).json({ message: 'Job seeker profile updated successfully' });
    });
  } catch (error) {
    console.error('Error updating job seeker profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Apply for a Job Endpoint
app.post('/applyForJob', (req, res) => {
  const { jobSeekerID, jobID } = req.body;

  // Create a job application entry and store it in your database
  const application = { jobSeekerID, jobID };

  const appliedJobsRef = db.ref('appliedjobs');

  // Generate a new key for the appliedJobs
  const newappliedJobsRef = appliedJobsRef.push();

  // Create the apllied job record with job and jobseeker ID.
  const appliedjob = {
    appliedJobId: newappliedJobsRef.key,
    jobSeekerID,
    jobID,
    status:`Pending`,
    applieddate: new Date().toISOString(),
    shortlisteddate:``,
    accpteddate:``,
    rejecteddate:``,
    hireddate:``,
    withdrawndate:``
  };
  // Save the employer information to Firebase
  newappliedJobsRef.set(appliedjob);
  res.status(200).json({ message: 'Application submitted successfully.' });
});

//Employers Actions on Job seeker api.
app.put('/updateJobApplicationStatus/:jobApplicationId', async (req, res) => {
  debugger
  try {
    const jobApplicationId = req.params.jobApplicationId;
    const { action } = req.body;

    const appliedJobsRef = db.ref('appliedjobs').child(jobApplicationId);

    // Define the updates object with the common 'status' field
    let updates = {
      status: '', 
    };

    // Update the 'status' and the dynamic date field based on the action
    if (action === 'shortlist') {
      updates.status = 'shortlisted';
      updates.shortlisteddate = new Date().toISOString();
    } else if (action === 'accept') {
      updates.status = 'accepted';
      updates.accepteddate = new Date().toISOString();
    } else if (action === 'reject') {
      updates.status = 'rejected';
      updates.rejecteddate = new Date().toISOString();
    } else if (action === 'hired') {
      updates.status = 'hired';
      updates.hireddate = new Date().toISOString();
    } else {
      // Handle other actions or errors here
      return res.status(400).json({ error: 'Invalid action' });
    }
      // Update the fields directly in the job application node
      await appliedJobsRef.update(updates);

    res.status(200).json({ message: `Job application status updated to ${updates.status}` });
  } catch (error) {
    console.error('Error updating job application status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch Jobs Applied by a Job Seeker Endpoint
app.get('/jobsAppliedByJobSeeker/:jobSeekerID', (req, res) => {
  debugger
  const jobSeekerID = req.params.jobSeekerID;

// Reference to the "appliedjobs" node in your database
const ref = db.ref('appliedjobs');

// Query the database to find entries with the specified jobSeekerID
ref
  .orderByChild('jobSeekerID')
  .equalTo(jobSeekerID)
  .once('value')
  .then((snapshot) => {
    const matchedEntries = snapshot.val();
    if (matchedEntries) {
      const jobIDs = Object.values(matchedEntries).map((entry) => entry.jobID);
      console.log('Job IDs for the matched entries:', jobIDs);
      res.status(200).json({ jobIDs });
    } else {
      console.log('No matching entries found for the specified jobSeekerID.');
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });

});

// Fetch Job Seekers Who Applied to a Particular Job Endpoint
app.get('/jobSeekersAppliedToJob/:jobID', (req, res) => {
  const jobID = req.params.jobID;

// Reference to the "appliedjobs" node in your database
const ref = db.ref('appliedjobs');

// Query the database to find entries with the specified jobID
ref
  .orderByChild('jobID')
  .equalTo(jobID)
  .once('value')
  .then((snapshot) => {
    const matchedEntries = snapshot.val();
    if (matchedEntries) {
      const jobSeekerID = Object.values(matchedEntries).map((entry) => entry.jobSeekerID);
      console.log('Job IDs for the matched entries:', jobSeekerID);
      res.status(200).json({ jobSeekerID });
    } else {
      console.log('No matching entries found for the specified jobSeekerID.');
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
});

//Endpoint to send application approval mail to applicant
function sendApprovalEmail(senderEmail, senderPassword, to, subject) {
  debugger
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with the appropriate service
    auth: {
      user: senderEmail,
      pass: senderPassword, // Use the recruiter's password or app password
    },
  });

  const mailOptions = {
    from: senderEmail, // Set the sender as the recruiter's email address
    to,
    subject,
    text: 'Your recruiter approval has been granted.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending error: ' + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
} 

app.post('/approve-recruiter', (req, res) => {
  debugger
  const { recruiterEmail, recruiterPassword, recipientEmail } = req.body;

  // Validate the recruiter's credentials, e.g., checking if they are authorized to perform approvals.

  // Update data in Firebase Realtime Database or Firestore as needed.

  // Send email using the provided recruiter's email and password
  sendApprovalEmail(recruiterEmail, recruiterPassword, recipientEmail, 'Recruiter Approval');
  res.send('Recruiter approval and notification sent.');
});

//testing endpoints

app.get('/', (req, res) => {
  return res.send('helloo')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
//set port and listen for our request