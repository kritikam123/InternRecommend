const multer = require("multer");
const path = require("path");

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx|jpeg|jpg|png/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype.toLowerCase());

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Only PDF, DOC, DOCX, JPG, PNG files allowed!");
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, filename);
  },
});

const uploadFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const resume = uploadFile.single("resume");

module.exports = { resume };
