const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Set up storage engine
const storage = multer.diskStorage({
  destination: "./uploads/", // Ensure this folder exists
  filename: (req, file, cb) => {
    const randomString = crypto.randomBytes(18).toString("hex");
    cb(null, Date.now() + randomString + path.extname(file.originalname));
  },
});

// File filter (optional, can be modified)
/*const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/pdf" || file.mimetype === "image/jpg"  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .png and .jpg .pdf .jpg files allowed"), false);
  }
};*/

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, and .pdf files allowed"), false);
  }
};


const upload = multer({ storage, fileFilter });

module.exports = upload;
