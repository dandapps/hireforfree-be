Folder

1. routes
2. User
3. Job
//Company table -> we will take comany details while recurtier signup and stor it in Comapnies Node 

//Employer filrter based on 

//AppliedJobs

Application-1 : JobID , JobseekerId , CurrentStatus: Applied/Employer Accepted/Rejected/Hold/jobclosed without action or user can withdrawn ,current action time and datae:  , nextaction name and date : dynmic .

//Filters we should consider fiters and add fields 

//Email communication , file upload , photo upload 

//Person cannot apply same job twice

//Update Profile of both and Update Job entry.


Email sender password:

qnob xano xwhb awgt




Resources:

//Notification source : https://www.youtube.com/watch?v=J8j_jzWPRtw&t=11s 

//Databse schema for messaging application: https://www.youtube.com/watch?v=Nt_gWiPMzNM  or https://www.youtube.com/watch?v=e3ZjrJQFK0M


Rules:

->Applicant cannot apply multiplejobs.
->check weather user/job exist or not.

Pending Tasks:

->Login with Google/Linkedin and Logout.
->Email Confiramtion after Signup
->Delete User
->Requriter/Job applicant  actions and updating job applications node
->Recuriter can have one page to see applicant with diffenent status like shortlisted applicant, Approved , rejected and hired applicants.
->Updating profile / Job Entry 
->Filters Logic - Inside Employer and Job applicant dashboard, Job Listing filtes
(Experince Level, Degree Compltetd , Degree Pursuing, Locaton based on country)
->Autorization or rules to modify nodes by each user.
->Check middleware and resturcture all apis with new folders.

->When recuriter clicks Enough Job application dont want to show then we should not display that job under list of jobs.
->When recuriter delete the job and then we should remove that from job entries and update the staus field as Job got removed from portal.
->When recuriter clicked on Hiring completed  & close job then we should remove it home page and update status to No Longer consideration for all applicants who applied to that job.

Status Field:  completed
 Pending - No action taken yet
 Shortlisted - who have advanced to the next stage. -Interfilter
 Accepted - applicant get an eamil and recuriter will reach out for interview scedule
 Rejected - After interview if he is not suitable he can reject
 Selected - After interview if he is selected
->If recruiter tried to close the job then we will ask him to update Hired and rejected status.(It helps this platform to grow)
JobId JobApplicantiD Status Shortlisteddat ,accepteddate.


->Updating profile / Job Entry -completed
->Need to finalize that password update is separate end point or not

current working task:
