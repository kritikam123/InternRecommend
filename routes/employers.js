const express = require("express");
const router = express.Router();
const {
  User,
  VerificationCode,
  Organization,
  Job,
  AppliedJobs,
} = require("../model/model.js");

const bcrypt = require("bcrypt");
const passport = require("passport");
const { where, Op, Sequelize, InvalidConnectionError } = require("sequelize");
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

const checkuser = function (req, res, next) {
  if (req.isAuthenticated()) {
    auth = true;
    data = req.user;
    if (req.user.role == "organization") return next();
    res.redirect("/employers/OrgProfile");
  } else {
    auth = false;
    data = "";
    res.redirect("/employers/employersLogin");
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

router.get("/employersRegister", (req, res) => {
  res.render("employers/employersRegister");
});

router.post("/employersRegister", async (req, res) => {
  const { username, email, password, cpassword } = req.body;
  console.log("Yeti samma chalcha ta???");
  console.log("user dataaa from formm", username, email, password, cpassword);
  let organization = await Organization.findOne({ where: { email: email } });
  console.log("USER INFORMATION", organization);

  if (organization) {
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

  organization = await Organization.create({
    name: username,
    email: email,
    password: hash,
  });

  res.json({
    status: 200,
    message: "Account registered successfully",
    title: "Registration Successful",
  });
});

router.get("/employersLogin", async (req, res) => {
  res.render("employers/employersLogin");
});

router.post("/employersLogin", async (req, res, next) => {
  console.log("emaployers login route");
  const { email, password, remember } = req.body;
  const organization = await Organization.findOne({ where: { email: email } });
  if (!organization) {
    return res.json({
      status: 400,
      title: "Invalid Credentials",
      message: "User does not exist",
    });
  }
  if (organization.verified != true) {
    return res.json({
      status: 400,
      title: "unverified",
      message: "Organization not verified by admin",
    });
  }
  console.log(
    "organizaaaaaaaaaaaaaaaa verification status",
    organization.verified
  );

  const passwordValidation = await bcrypt.compare(
    password,
    organization.password
  );
  if (passwordValidation == false) {
    return res.json({
      status: 400,
      title: "Wrong password",
      message: "Incorrect Password",
    });
  } else {
    //authentication part
    passport.authenticate("organizationn", (error, user) => {
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
          message: "You have successfully logged in as an organization",
          title: "login successful",
          organization: {
            id: organization.id,
            email: organization.email,
          },
        });
      });
    })(req, res, next);
    console.log("login successful");
  }
});

router.get("/OrgProfile", checkuser, async (req, res) => {
  const email = req.user.email;
  console.log("org profile email", email);
  const organization = await Organization.findOne({ where: { email: email } });

  console.log("organizationnnnnnnnn dataaaaaaaaaaaaaaaa", organization);
  res.render("employers/OrgProfile", { organization: organization });
});

router.post("/OrgProfile", checkuser, async (req, res) => {
  console.log("POST REQUESSTTTT HITTTTTTTTTTTTTTT");
  const location = req.body.location;
  const phone = req.body.phone;
  const fax = req.body.fax;
  const web = req.body.web;
  const fb = req.body.fb;
  const linkedin = req.body.linkedin;
  const description = req.body.description;
  const email = req.user.email;
  console.log(location, phone, fax, web, fb, linkedin, description);

  try {
    const organization = await Organization.findOne({
      where: { email: email },
    });
    if (!organization) {
      return res.json({
        status: 400,
        title: failed,
        message: "user not found",
      });
    }
    await organization.update({
      location: location,
      phone: phone,
      fax: fax,
      website: web,
      facebookLink: fb,
      linkedin: linkedin,
      description: description,
    });

    console.log("organizationnn updated successfullyyyyy");

    return res.json({
      status: 200,
      title: "success",
      message: "Organization Profile Updates Successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});
router.get("/OrgJobpost", checkuser, async (req, res) => {
  const email = req.user.email;

  res.render("employers/OrgJobpost");
});

router.post("/OrgJobPost", checkuser, async (req, res) => {
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
  console.log(
    "job post data",
    title,
    openeings,
    category,
    jobtype,
    remote,
    experience,
    education,
    location,
    expirey,
    salary,
    description,
    requirements,
    parsedSkills
  );

  try {
    const job = await Job.create({
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
    });
    return res.json({
      status: 200,
      title: "success",
      message: "Job Posted Successfully",
    });
  } catch (err) {
    console.log("error while posting job", err);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.get("/OrgSettings", (req, res) => {
  res.render("employers/OrgSettings");
});

router.get("/OrgJoblist", async (req, res) => {
  console.log("req userrrrrrrrrrrrrrrr", req.user.id);
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const [affectedRows] = await Job.update(
    { status: "expired" },
    {
      where: {
        organizationId: req.user.id,
        expirey: {
          [Op.lt]: Sequelize.literal("CURDATE()"),
        },
      },
    }
  );

  console.log("Expired jobs updated:", affectedRows);
  await Job.findAll({ where: { organizationId: req.user.id } }).then(
    async (jobs) => {
      console.log("THIS ORG JOBSSSSSSSSSSS", jobs);

      res.render("employers/OrgJoblist", { jobs: jobs, orginfo: req.user });
    }
  );
});

router.get("/OrgJoblist/EditJob", checkuser, async (req, res) => {
  const jobdetails = await Job.findOne({ where: { id: req.query.id } });
  res.render("employers/editjob", { jobdetails: jobdetails });
});

router.post("/OrgJobList/EditJob", checkuser, async (req, res) => {
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

router.get("/OrgViewApplicants", checkuser, async (req, res) => {
  const orgid = req.user.id;
  // console.log("====================================");
  // console.log(orgid);
  // console.log("====================================");
  try {
    const applicants = await AppliedJobs.findAll({
      where: { OrganizationId: orgid },
      include: [
        {
          model: Organization,
        },
        {
          model: Job,
        },
        {
          model: User,
        },
      ],
    });
    console.log("====================================");
    // console.log(applicants);
    applicants.forEach((app) => {
      console.log("job: ", app.job);
      console.log("Organization : ", app.Organization);
      console.log("user", app.User);
    });
    console.log("====================================");
    res.render("employers/OrgViewApplicants", { applicants: applicants });
  } catch (error) {
    console.log("errorr: ", error);
  }
});

router.get("/applicants/details", checkuser, async (req, res) => {
  const userId = req.query.id;
  const org_id = req.user.id;
  console.log("organizaaaaaaaaaaaaaaaa", org_id);
  try {
    const user = await User.findOne({ where: { user_id: userId } });
    const resumeURL = user.resume ? `/uploads/${user.resume}` : null;
    // console.log("====================================");
    // console.log("the user for job details: ", user);
    // console.log("====================================");

    const applicants = await AppliedJobs.findOne({
      where: { Organizationid: org_id, UserUserId: userId },
    });
    // console.log("====================================");
    // console.log("theeeeeeeeee apllicantsss areeeee", applicants);
    // console.log("====================================");
    res.render("employers/applicants-details", {
      user: user,
      resumeURL: resumeURL,

      applicants: applicants,
    });
  } catch (error) {
    console.log("errorr: ", error);
  }
});

router.post("/applicants/save", checkuser, async (req, res) => {
  const { applicationId } = req.body;
  console.log(applicationId);
  try {
    await AppliedJobs.update(
      { status: "accepted" },
      {
        where: { id: applicationId },
      }
    );
    console.log("job statusss updatedddddd");
    return res.json({
      status: 200,
      title: "success",
      message: "Applicant accepted successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.post("/applicants/cancel", checkuser, async (req, res) => {
  const { applicationId } = req.body;
  console.log(applicationId);
  try {
    await AppliedJobs.update(
      { status: "rejected" },
      {
        where: { id: applicationId },
      }
    );
    console.log("job statusss updatedddddd");
    return res.json({
      status: 200,
      title: "success",
      message: "Applicant rejected successfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      title: "failed",
      message: "something went wrong while updating",
    });
  }
});

router.get("/details1", (req, res) => {
  res.render("employers/details");
});

router.get("/details2", (req, res) => {
  res.render("employers/details2");
});

module.exports = router;
