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

router.get("/job-list", checkuser, async (req, res) => {
  console.log("JOB LIST FOR ADMINNNN");
  const jobs = await Job.findAll({ include: [{ model: Organization }] });
  console.log(jobs);
  res.render("admin/admin-view-job", { jobs: jobs });
});

router.get("/job-list/edit-job", checkuser, async (req, res) => {
  const jobDetails = await Job.findOne({ where: { id: req.query.id } });
  res.render("admin/edit-job", { jobdetails: jobDetails });
});

router.post("/job-list/edit-job", checkuser, async (req, res) => {
  const title = req.body.title;
  const openeings = req.body.openeings;
  const category = req.body.category;
  const jobtype = req.body.jobtype;
  const remote = req.body.remote;
  const experience = req.body.experience;
  const education = req.body.education;
  const location = req.body.location;
  const expirey = req.body.expirey;
  const salary = req.body.salary;
  const description = req.body.description;
  const requirements = req.body.requirements;
  const email = req.user.email;
  const skills = req.body["skills"];
  const parsedSkills = Array.isArray(skills) ? skills : skills ? [skills] : [];

  console.log("====================================");
  console.log("QUERYYYYYYYYYYYYYYYYYYYYYYYY", req.query.id);
  console.log("====================================");
  try {
    const job = await Job.update(
      {
        title: title,
        openeings: openeings,
        category: category,
        jobType: jobtype,
        remote: remote,
        experience: experience,
        education: education,
        expirey: expirey,
        salary: salary,
        description: description,
        requirements: requirements,
        requiredskills: parsedSkills,
        OrganizationId: req.user.id,
      },
      {
        where: { id: req.query.id },
      }
    );
    return res.json({
      status: 200,
      title: "success",
      message: "Job Updated Successfully",
    });
  } catch (err) {
    console.log("error while updating job", err);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

module.exports = router;
