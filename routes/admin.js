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
const { where } = require("sequelize");

const checkuser = function (req, res, next) {
  console.log("REQ IS AUTHENTICATEDD", req.isAuthenticated());
  if (req.isAuthenticated()) {
    auth = true;
    data = req.user;
    if (req.user.role == "admin") {
      res.redirect("/admin/job-list");
    }
    next();
  } else {
    auth = false;
    data = "";
    res.redirect("/admin/login");
  }
};

router.get("/login", async (req, res) => {
  console.log("admin login");
  res.render("admin/admin-login");
});

router.post("/login", async (req, res, next) => {
  console.log("admin login hit");

  const { email, password, remember } = req.body;

  //<------------------AUTHENTICATION--------------------------------->
  passport.authenticate("admin", (error, user, info) => {
    if (error) {
      console.error("Authentication error:", error);
      return res.json({
        status: 400,
        title: "Login Failed",
        message: error.message || "Authentication failed",
      });
    }

    if (!user) {
      return res.json({
        status: 400,
        title: "Login Failed",
        message: "Cannot authenticate admin, invalid email or password",
      });
    }
    console.log("Login successful, user ID:", user.id);
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.log("login error", loginErr);
        return res.json({
          status: 500,
          title: "Server Error",
          message: "Admin Login Failed",
        });
      }

      console.log("Remember me:", remember);
      if (remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.expires = false;
      }

      //<--------------------DEBUGGING SESSION---------------------->
      console.log("Session after login: ", req.session);
      console.log("Passport in session:", req.session.passport);
      console.log("User after login:", req.user);
      res.json({
        status: 200,
        message: "You have successfully logged in as a Admin",
        title: "login successful",
        admin: {
          id: user.id,
          email: user.email,
        },
      });
    });
    // req.session.save((err) => {
    //   if (err) console.log("Session save error:", err);
    //   console.log("Session saved successfully");
    // });
  })(req, res, next);
  console.log("login successful");
});

router.get("/job-list", checkuser, async (req, res) => {
  console.log("JOB LIST FOR ADMINNNN");
  const jobs = await Job.findAll({ include: [{ model: Organization }] });
  // console.log(jobs);2004
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

router.get("/organization", checkuser, async (req, res) => {
  const org = await Organization.findAll();
  // org.forEach((o) => {
  //   console.log("organization are: ", o);
  // });
  res.render("admin/view-organization", { org: org });
});

router.post("/organization/accept", checkuser, async (req, res) => {
  const { organizationId } = req.body;
  console.log("ORGANIZATIONNN IDDD ISSSS", organizationId);
  try {
    await Organization.update(
      { verified: 1 },
      { where: { id: organizationId } }
    );
    console.log("job status updated");
    return res.json({
      status: 200,
      title: "success",
      message: "Organization accepted successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.post("/organization/cancel", checkuser, async (req, res) => {
  const { organizationId } = req.body;
  console.log("ORGANIZATIONNN IDDD ISSSS", organizationId);
  try {
    await Organization.update(
      { verified: 0 },
      { where: { id: organizationId } }
    );
    console.log("job status updated");
    return res.json({
      status: 200,
      title: "success",
      message: "Organization declined successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.get("/users", checkuser, async (req, res) => {
  console.log("user route hitt");
  try {
    const users = await User.findAll();
    users.forEach((user) => {
      console.log(user);
    });
    res.render("admin/view-users", { users: users });
  } catch (error) {
    console.log("An error occured while fetching users", error);
  }
});

//fetching users 
router.get("/applicants/details", checkuser, async (req, res) => {
  console.log("get paramter hittt");
  const userId = req.query.id;
  console.log(userId);
  try {
    const user = await User.findOne({ where: { user_id: userId } });
    const resumeURL = user.resume ? `/uploads/${user.resume}` : null;
    res.render("admin/user-details", {
      user: user,
      resumeURL: resumeURL,
    });
  } catch (error) {}
});
//fetching users completed

//for deleting users
router.post("/applicants/cancel", checkuser, async (req, res) => {
  const { userId } = req.body;
  console.log(userId); 

  try {
    await User.destroy({
      where: { user_id: userId },
    });

    console.log("user deleted from database");

    return res.json({
      status: 200,
      title: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("An error occurred while deleting user", error);
    return res.json({
      title: "failed",
      message: "Something went wrong while deleting user",
    });
  }
});
//deleting users part completed



module.exports = router;
