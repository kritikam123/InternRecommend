const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static("public", { type: "text/css" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/contactus", (req, res) => {
  res.render("contactus");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/internship", (req, res) => {
  res.render("internship");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
