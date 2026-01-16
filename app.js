const express = require("express");
const path = require("path");
const db = require("./model/model.js");
const session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const app = express();
const { Server } = require("socket.io");
const uploadDir = path.join(__dirname, "uploads");
const { createServer } = require("node:http");
const server = createServer(app);
const io = new Server(server);
require("./config/passport")(passport);

const fs = require("fs");
const multer = require("multer");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);
  socket.on("join-role", (role) => {
    if (role === "jobseeker") {
      socket.join("jobseeker");
      console.log("jobseeker joined the room");
    }

    if (role === "organization") {
      socket.join("organization");
      console.log("organization joined the room");
    }
  });
  socket.on("disconnect", () => {
    console.log("users disconnected");
  });
});

//using middlewares
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

//for sessions
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

// Add after app.use(passport.session())
// app.use((req, res, next) => {
//   console.log("\n=== PASSPORT DEBUG ===");
//   console.log("Path:", req.path);
//   console.log("Session ID:", req.sessionID);
//   console.log("Session:", req.session);
//   console.log("Passport data in session:", req.session.passport);
//   console.log("req.user:", req.user);
//   console.log("req.isAuthenticated():", req.isAuthenticated());
//   console.log("====================\n");
//   next();
// });

app.use((req, res, next) => {
  console.log("=== DEBUG MIDDLEWARE ===");
  // console.log("Session ID:", req.sessionID);
  // console.log("Session:", req.session);
  // console.log("User:", req.user);
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("=== END DEBUG ===");
  next();
});

// app.get("/sidebar", (req, res) => {
//   res.render("sidebar");
// });

const indexRoute = require("./routes/index.js");
app.use("/", indexRoute);

const employersRoute = require("./routes/employers.js");
app.use("/employers", employersRoute);

const adminRoute = require("./routes/admin.js");
app.use("/admin", adminRoute);

const authRoute = require("./routes/auth.js");
const { Socket } = require("node:dgram");
app.use("/auth", authRoute);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
