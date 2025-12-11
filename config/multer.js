//importing libaries/ dependencies
const multer = require("multer");
const path = require("path");

function checkFileType(file, cb) {
  //allowed type
  const filetypes = /jpeg|jpg|png/;
  //check type
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Image Only!");
  }
}

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
});
//initialization
const uploadFile = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
const resume = uploadFile.fields([{ name: "pdfFile" }]);
module.exports = {
  resume,
};
