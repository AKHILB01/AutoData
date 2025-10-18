const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadIdProof, getIdData } = require("../controllers/formController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .png, and .pdf files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

const router = express.Router();
router.post("/upload-id", upload.single("idProof"), uploadIdProof);
router.get("/data", getIdData);

module.exports = router;
