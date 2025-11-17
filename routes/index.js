const express = require("express");
const router = express.Router();
const { User } = require("../model/model");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { where } = require("sequelize");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword");
});

router.get("/verify", (req, res) => {
  res.render("verify");
});

router.get("/users/userIndex",(req,res)=>{
  res.render("users/userIndex")
})

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
