const express = require("express");
const router = express.Router();
const {
  User,
  VerificationCode,
  Organization,
  Job,
  AppliedJobs,
} = require("../model/model.js");
const axios = require("axios");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { where, Op } = require("sequelize");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const { resume } = require("../config/multer.js");
const { title } = require("process");

//defining storage to upload file-------------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });
//--------------------------------------------

//mailer credentials:
const mailer = {
  pass: process.env.MAILPASS,
  mail: process.env.MAILID,
};

console.log(
  "Mailer credentials: ",
  mailer.mail,
  mailer.pass ? "*****" : "Missing"
);

var auth;
var data;

const checkuser = function (req, res, next) {
  if (req.isAuthenticated()) {
    auth = true;
    data = req.user;
    if (req.user.role == "jobseeker") return next();
    res.redirect("/users/UserDashboard");
  } else {
    auth = false;
    data = "";
    res.redirect("/users/login");
  }
};

function generateCode() {
  return Math.floor(Math.random() * 100000).toString();
}

async function updateVerification(code, email) {
  try {
    await VerificationCode.update(
      { code, updatedAt: new Date() },
      { where: { email } }
    );
    console.log("Verification code updated for email:", email);
  } catch (error) {
    console.log("Error updating verification code", error);
  }
}

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/contactus", (req, res) => {
  res.render("contactus");
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/internship", (req, res) => {
  res.render("internship");
});

router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword");
});

router.post("/forgotpassword", async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    console.log("email iss:  ", email);

    const verification = generateCode();
    console.log("verification code is: ", verification);

    const existing_code = await VerificationCode.findOne({
      where: { email: email },
    });

    if (existing_code) {
      await updateVerification(verification, email);
    } else {
      const verification_code = await VerificationCode.create({
        email: email,
        code: verification,
      });

      console.log("verificated code insterted to database", verification_code);
    }
    //mail sending part:
    if (!mailer.mail || !mailer.pass) {
      console.log(
        "Verification code cant be generated: SMTP credentials missing"
      );
    }
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // type: "LOGIN",
        user: mailer.mail,
        pass: mailer.pass,
      },
    });

    let mailOptions = {
      from: mailer.mail,
      to: email,
      subject: "Verification Code",
      text: "Thankyou for registering with Intern Recommendation, here is your verification code",
      html: `<body style="padding: 0; margin: 0; box-sizing:border-box;">
                                          <div style="text-align:center;">
                                              <div>
                                                  <img style="width:400px; height:400px;" src="https://img.freepik.com/free-vector/smartphone-data-protection-flat-composition-with-human-character-password-bubble-fingerprint-sign-screen-letter-vector-illustration_98292-8759.jpg">                                
                                              </div>
                                              <div style="font-size: 30px; color:#0085FF">
                                                  <p style="font-size:18px; color:#000000">Here is Verification code:</p>
                                                  <p style="font-size: 35px; color:#0085FF; margin:0;"><b>${verification}</b></p>
                                                  
                                              </div
                                              
                                          </div>
                                      </body>`,
    };
    (async () => {
      const info = transporter.sendMail(mailOptions).then((info) => {
        console.log(`code sent to:${info.messageId}`);
      });
    })();

    console.log("EMAIL SENTTTTTTTTTTTTTTTTTTTTTTTT");
    const data = {
      status: 200,
      message: "Verification Code Sent Suucesfully",
      title: "success",
    };
    return res.json(data);
  } catch (error) {
    console.error("Error in forgotpassword:", error);
    return res.status(500).json({
      message: "Internal server error",
      title: "error",
    });
  }
});

router.get("/verify", async (req, res) => {
  const email = req.query.email;
  console.log(email);

  if (!email) {
    console.log("invalidd");
  }

  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    console.log("user does not exist");
  }
  res.render("verify");
});

router.post("/verify", async (req, res) => {
  console.log(req.body);
  let code = req.body.code.trim();
  let email = req.body.email.trim();
  try {
    const allCodes = await VerificationCode.findAll({ where: { email } });
    console.log("All codes for email:", allCodes);

    const vcode = await VerificationCode.findOne({
      where: {
        email: email,
        code: code,
      },
    });

    console.log("Found verification code:", vcode);

    if (!vcode) {
      console.log("No matching verification code found");
      return res.status(400).json({
        message: "Invalid verification code",
        title: "error",
      });
    }

    //delete and update
    console.log("testtesstttt");
    await VerificationCode.destroy({ where: { id: vcode.id } });
    const data = {
      status: 200,
      message: "You have been verified as a user, please change your password",
      title: "success",
    };

    return res.json(data);
  } catch (error) {
    console.log("Verification error: ", error);
    return res.status(500).json({
      message: "Internal server error",
      title: "error",
    });
  }
});

router.get("/validation", (req, res) => {
  res.render("validation");
});

router.get("/validationFinal", (req, res) => {
  res.render("validationFinal");
});

router.get("/users/userIndex", (req, res) => {
  res.render("users/userIndex");
});

router.get("/users/login", (req, res) => {
  res.render("users/login");
});

router.get("/users/userdashboard", checkuser, async (req, res) => {
  const email = req.user.email;
  console.log(
    "The email for dashboard isssssssssssssssssssssssssssssssssss: ",
    email
  );

  const user = await User.findOne({ where: { email: email } });
  data = {
    user: user,
  };

  console.log("DASHBOARD DATTAAA", data);
  // console.log("DASHBOARD USERRRRRRRRRRRRRR", user);
  res.render("users/UserDashboard", { data: data });
});

router.post("/users/userdashboard", checkuser, async (req, res) => {
  console.log("post requesstttttttttt hittttttttttttttttttttt");
  const email = req.user.email;
  const location = req.body.location;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const objective = req.body.objective;

  const skills = req.body["skills"];
  const parsedSkills = Array.isArray(skills) ? skills : skills ? [skills] : [];

  console.log(email, location, phone, gender, objective, parsedSkills);

  try {
    const user = await User.findOne({ where: { email: email } });
    // console.log("user data for user education: ", user);
    if (!user) {
      return res.json({
        status: 400,
        title: failed,
        message: "user not found",
      });
    }
    await user.update({
      location: location,
      phone: phone,
      gender: gender,
      objective: objective,
      skills: parsedSkills,
    });

    console.log("userr updated successfullyyyyy");

    return res.json({
      status: 200,
      title: "success",
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.get("/users/UserEducation", checkuser, (req, res) => {
  console.log(
    "user id educationnnnnnnnnn isssssssssssssssssssssssssssss",
    req.user.user_id
  );
  res.render("users/UserEducation");
});

router.post("/users/UserEducation", checkuser, async (req, res) => {
  const education = req.body.education;
  const email = req.user.email;

  console.log("The data for education are: ", education, email);
  try {
    const user = await User.findOne({ where: { email: email } });
    // console.log("user data for user education: ", user);
    if (!user) {
      return res.json({
        status: 400,
        title: "failed",
        message: "user not found",
      });
    }

    const existingEdu = user.education || [];

    const updatedEdu = [...existingEdu, ...education];

    console.log("updated user education", updatedEdu);
    await user.update({ education: updatedEdu });
    return res.json({
      status: 200,
      title: "success",
      message: "Education updated successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.get("/users/UserExperience", checkuser, (req, res) => {
  console.log("user id isssssssssssssssssssssssssssss", req.user.user_id);
  res.render("users/UserExperience");
});

router.post("/users/UserExperience", checkuser, async (req, res) => {
  const experiences = req.body.experiences;
  const email = req.user.email;
  console.log(email);
  console.log(experiences);
  try {
    const user = await User.findOne({ where: { email } });
    // console.log("user data for user experiences", user);

    if (!user) {
      return res.json({
        status: 400,
        title: failed,
        message: "user not found",
      });
    }

    const existing = user.experience || [];

    const updatedExp = [...existing, ...experiences];

    //update query
    await user.update({ experience: updatedExp });
    return res.json({
      status: 200,
      title: "success",
      message: "Experience updated successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }

  res.json({ success: true, message: "Experiences saved successfully" });
});

router.get("/users/AdditionalInfo", (req, res) => {
  res.render("users/AdditionalInfo");
});

// console.log('====================================');
//PYTHON AND NODE JS CONNECTION TEST

// router.post("/users/AdditionalInfo", async (req, res) => {
//   const email = req.body.email;

//   const user = await User.findOne({ where: { email: email } });
//   // console.log("Testttt userrrrrrrr", user);

//   const data = user.skills;
//   try {
//     const response = await axios.post("http://localhost:8000/process-skills",
//     {data: data})
//     console.log("Response from Python:", response.data);
//     res.json({
//       message: "Data sent to Python!",
//       pythonResponse: response.data,
//     });
//   } catch (error) {
//     console.error("Error sending to Python:", error.message);
//     res.status(500).send("Failed to send data to Python");
//   }
//   console.log("skill dataa:  ", data);
// });

// console.log("====================================");

router.post("/users/additionalinfo", checkuser, resume, async (req, res) => {
  const { social, linkedin, git } = req.body;
  // console.log(social)
  const email = req.user.email;

  const resumeFile = req.file ? req.file.filename : null;

  console.log("Uploaded file:", req.file);

  console.log("Received:", social, linkedin, git, resumeFile);
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.json({
        status: 400,
        title: failed,
        message: "user not found",
      });
    }
    await user.update({
      resume: resumeFile,
      social_media: social,
      linkedin: linkedin,
      github: git,
    });
    console.log("userr updated successfullyyyyy");

    return res.json({
      status: 200,
      title: "success",
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.log("ERRRRRRRRRRRORRRRRRRRRRRRRRRRRRRRRRRRRRRR", error);
    return res.json({
      status: 404,
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.get("/users/viewresume", checkuser, async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.json({
        status: 400,
        title: failed,
        message: "user not found",
      });
    }
    const resumeURL = user.resume ? `/uploads/${user.resume}` : null;
    console.log("====================================");
    console.log("User Resume Url", resumeURL);
    console.log("====================================");

    res.render("users/view-resume", { resumeURL: resumeURL });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/users/socials", checkuser, async (req, res) => {
  const email = req.user.email;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.json({
        status: 400,
        title: failed,
        message: "user not found",
      });
    }
    const data = {
      social: user.social_media,
      github: user.github,
      linkedin: user.linkedin,
    };

    res.render("users/social-details", { data: data });
  } catch (error) {}
});

router.get("/users/education", checkuser, async (req, res) => {
  const email = req.user.email;
  console.log(email);
  const user = await User.findOne({ where: { email: email } });
  const education = user.education;
  console.log("educationn for user: ", education);
  res.render("users/educationdetails", { education: education });
});

router.get("/users/experience", checkuser, async (req, res) => {
  const email = req.user.email;
  console.log(email);
  const user = await User.findOne({ where: { email: email } });
  const experience = user.experience;
  console.log("educationn for user: ", experience);
  res.render("users/experiencedetails", { experience: experience });
});

router.post("/users/login", async (req, res, next) => {
  console.log("user login route");
  const { email, password, remember } = req.body;
  // console.log("jobseeker user email and password", email, password);
  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    return res.json({
      status: 400,
      title: "Invalid Credentials",
      message: "User does not exist",
    });
  }
  const passwordValidation = await bcrypt.compare(password, user.password);
  if (passwordValidation == false) {
    return res.json({
      status: 400,
      title: "Wrong password",
      message: "Incorrect Password",
    });
  } else {
    //authentication part
    passport.authenticate("users", (error, user) => {
      // console.log("USERRRRRSSSSSSS", user);

      if (error) {
        return next(error);
      }

      if (!user) {
        return res.json({
          status: 400,
          title: "Login Failed",
          message: "Invalid email or password",
        });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.log("Login Error", loginErr);
          return res.json({
            status: 500,
            title: "Server Error",
            message: "Failed to log in",
          });
        }

        if (req.body.remember) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
          req.session.cookie.expires = false;
        }

        console.log("Login successful, user ID:", user.user_id);

        // Debug: check what's in session immediately after login
        console.log("Session after login:", req.session);
        console.log("User after login:", req.user);
        res.json({
          status: 200,
          message: "You have successfully logged in as a user",
          title: "login successful",
          user: {
            id: user.user_id,
            email: user.email,
          },
        });
      });
    })(req, res, next);
    console.log("login successful");
  }
});

router.get("/users/registration", (req, res) => {
  res.render("users/registration");
});

router.post("/users/registration", async (req, res) => {
  const { username, email, password, cpassword } = req.body;
  console.log("Yeti samma chalcha ta???");
  console.log("user dataaa from formm", username, email, password, cpassword);
  let user = await User.findOne({ where: { email: email } });
  console.log("USER INFORMATION", user);

  if (user) {
    const data = {
      staus: 409,
      message: "Email already registered. Please use a different email.",
      title: "Existing Email",
    };
    return res.json(data);
  }
  if (password != cpassword) {
    const data = {
      message: "Passwords do not match. Please try again.",
      status: 400,
      title: "Password Mismatch",
    };
    return res.json(data);
  }
  const hash = await bcrypt.hash(password, 10);

  user = await User.create({
    username: username,
    email: email,
    password: hash,
  });

  res.json({
    status: 200,
    message: "Account registered successfully",
    title: "Registration Successful",
  });
});

router.get("/users/jobs", checkuser, async (req, res) => {
  console.log("req userrrrrrrrrrrrrrrr", req.user.id);
  Job.findAll().then((jobs) => {
    console.log("THIS ORG JOBSSSSSSSSSSS", jobs);
    res.render("users/joblist", { jobs: jobs, orginfo: req.user });
  });
});

router.get("/users/jobdetails/viewdetails", checkuser, async (req, res) => {
  const email = req.user.email;
  console.log("The email for job details issssssssssssssssssss", email);
  const query = req.query.id;
  console.log("====================================");
  console.log("The queryy isssssssssss", query);
  console.log("====================================");

  const job = await Job.findOne({
    where: { id: query },
    include: [
      {
        model: Organization,
        attributes: ["id", "name", "location"],
      },
    ],
  });
  console.log("THEEEE JOBBBBBBBBB DATAAAAAA", job);
  console.log("THEEEE ORRGGGGGGGGGGGGGG DATAAAAAA", job.Organization.name);
  res.render("users/jobdetails", { job: job });
});

router.post("/users/apply", checkuser, async (req, res) => {
  const userId = req.user.user_id;
  console.log("====================================");
  console.log(userId);
  console.log("====================================");
  const { jobId, orgId } = req.body;
  try {
    const alreadyApplied = await AppliedJobs.findOne({
      where: { UserUserId: userId, jobId: jobId },
    });
    if (alreadyApplied) {
      const data = {
        message: "Job already applied",
        status: 400,
        title: "failed",
      };
      return res.json(data);
    }
    const user = await User.findOne({ where: { user_id: userId } });

    const resume = user.resume;
    const resumeURL = user.resume ? `/uploads/${user.resume}` : null;
    let date = new Date().toISOString().split("T")[0];
    const appliedJob = await AppliedJobs.create({
      UserUserId: userId,
      jobId: jobId,
      OrganizationId: orgId,
      cvUrl: resumeURL,
      applicationDate: date,
    });
    return res.json({
      status: 200,
      message: "Job Applied Successfully",
      title: "success",
    });
  } catch (error) {
    console.log("error: ", error);
    return res.json({
      status: 200,
      message: "Something Went Wrong",
      title: "failed",
    });
  }
});

router.get("/users/appliedjobs", checkuser, async (req, res) => {
  const user_id = req.user.user_id;
  console.log(user_id);

  try {
    const user_applied = await AppliedJobs.findAll({
      where: { UserUserId: user_id },
      include: [
        {
          model: User,
        },
        {
          model: Job,
        },
        {
          model: Organization,
        },
      ],
    });
    console.log("====================================");
    user_applied.forEach((user) => {
      console.log("job", user.job);
      console.log("job", user.Organization);
      console.log("userrrrrr", user.User);
    });
    console.log("====================================");
    res.render("users/applied-jobs", { users: user_applied });
  } catch (error) {
    console.log("errorr: ", error);
  }
});
module.exports = router;
