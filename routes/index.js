const express = require("express");
const router = express.Router();
const { User, VerificationCode } = require("../model/model.js");

const bcrypt = require("bcrypt");
const passport = require("passport");
const { where } = require("sequelize");
const nodemailer = require("nodemailer");

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

const ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    auth = true;
    data = req.user;
  } else {
    auth = false;
    data = "";
  }
  next();
};

function generateCode() {
  return Math.floor(Math.random() * 100000).toString();
}

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/forgotpassword", ensureAuthenticated, (req, res) => {
  res.render("forgotpassword");
});

router.post("/forgotpassword", async (req, res) => {
  try {
    const email = req.body.femail;
    console.log(email);

    const verification = generateCode();
    console.log("verification code is: ", verification);
    const verification_code = await VerificationCode.create({
      email: email,
      code: verification,
    });

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

    return res.json({
      message: "Received email",
      email: req.body.femail,
      verificationCode: verification,
    });
  } catch (error) {
    console.error(`Error sending mail: ${error.message}`);
  }
});

router.get("/verify", ensureAuthenticated, (req, res) => {
  res.render("verify");
});

router.get("/users/userIndex", (req, res) => {
  res.render("users/userIndex");
});

router.get("/users/login", (req, res) => {
  res.render("users/login");
});

router.get("/users/UserDashboard", (req, res) => {
  res.render("users/UserDashboard");
});

router.get("/users/UserEducation", (req, res) => {
  res.render("users/UserEducation");
});

router.get("/users/UserExperience", (req, res) => {
  res.render("users/UserExperience");
});

router.get("/users/AdditionalInfo", (req, res) => {
  res.render("users/AdditionalInfo");
});

router.post("/users/login", ensureAuthenticated, async (req, res, next) => {
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
      if (req.body.remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.expires = false;
      }
      res.json({
        status: 200,
        message: "You have successfully logged in as a user",
        title: "login successful",
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
module.exports = router;
