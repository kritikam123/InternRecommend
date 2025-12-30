const express = require("express");
const router = express.Router();
const {
  Admin,
  User,
  Organization,
  Job,
  AppliedJobs,
} = require("../model/model.js");

const bcrypt = require("bcrypt");
const passport = require("passport");

const checkuser = function (req, res, next) {
  if (req.isAuthenticated()) {
    auth = true;
    data = req.user;
    if (req.user.role == "admin") return next();
    res.redirect("/admin/profile");
  } else {
    auth = false;
    data = "";
    res.redirect("/admin/login");
  }
};

router.get("/login", async (req, res) => {
  res.render("admin/admin-login");
});

router.post("/login", async (req, res, next) => {
  console.log("====================================");
  console.log("ADDDMINNNNN LOGINN ROUTE HITT");
  console.log("====================================");
  const { email, password } = req.body;
  const remember = req.body.remember;
  const admin = await Admin.findOne({ where: { email: email } });
  console.log("ADMINNNNNNNNNNNNNNN: ", admin);

  if (!admin) {
    return res.json({
      status: 400,
      title: "Invalid Credentials",
      message: "Admin not found",
    });
  }

  const passwordValidation = await bcrypt.compare(password, admin.password);

  if (passwordValidation == false) {
    return res.json({
      status: 400,
      title: "Password Incorrect",
      message: "Incorrect Password",
    });
  } else {
    //<------------------AUTHENTICATION--------------------------------->
    passport.authenticate("admin", (error, user) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.json({
          status: 400,
          title: "Login Failed",
          message: "Cannot authenticate admin, invalid email or password",
        });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.log("====================================");
          console.log("login erorr", loginErr);
          console.log("====================================");

          return res.json({
            status: 500,
            title: "Server Error",
            message: "Admin Login Failed",
          });
        }
      });

      console.log("====================================");
      console.log(remember);
      console.log("====================================");

      if (remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.expires = false;
      }
      console.log("Login successful, user ID:", user.user_id);

      //<--------------------DEBUGGING SESSION---------------------->
      console.log("Session after login: ", req.session);
      console.log("User after login:", req.user);
      res.json({
        status: 200,
        message: "You have successfully logged in as a Admin",
        title: "login successful",
        admin: {
          id: admin.id,
          email: admin.email,
        },
      });
    })(req, res, next);
    console.log("login successful");
  }
});



module.exports = router;
