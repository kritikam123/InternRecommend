const express = require("express");
const path = require("path");
const db = require("./model/model.js");
const session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const app = express();
require("./config/passport")(passport);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static("public", { type: "text/css" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "text/javascript ");
      }
    },
  })
);

var options = {
  host: process.env.HOST,
  port: 3306,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DATABASE,
};
var sessionStore = new MySQLStore(options);

app.use(
  session({
    secret: "krishtina",
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/contactus", (req, res) => {
  res.render("contactus");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/internship", (req, res) => {
  res.render("internship");
});

// app.get("/sidebar", (req, res) => {
//   res.render("sidebar");
// });

const indexRoute = require("./routes/index.js");
app.use("/", indexRoute);

const employersRoute = require("./routes/employers.js");
app.use("/employers", employersRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
