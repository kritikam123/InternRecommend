const express = require("express");
const router = express.Router();
const { User, VerificationCode, Organization } = require("../model/model.js");

const bcrypt = require("bcrypt");
const passport = require("passport");
const { where, Op } = require("sequelize");
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
module.exports = router;
