const express = require("express");
const router = express.Router();
const { User } = require("../model/model");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { where } = require("sequelize");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/users/login", (req, res) => {
  res.render("users/login");
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
