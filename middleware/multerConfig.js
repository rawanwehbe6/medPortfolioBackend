const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
  destination: "./uploads/", // Ensure this folder exists
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter (optional, can be modified)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Only .png and .jpg files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
