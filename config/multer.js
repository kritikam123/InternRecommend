//importing libaries/ dependencies
const multer = require("multer");
const path = require("path");

//store destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); //destination foldder
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, baseName + ext);
  },

  //ini

  
});
