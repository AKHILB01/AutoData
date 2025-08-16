const express = require("express");
const multer = require("multer");
const { uploadIdProof } = require("../controllers/formController");

const upload = multer({ dest: "uploads/" });

const router = express.Router();
router.post("/upload-id", upload.single("idProof"), uploadIdProof);

module.exports = router;
