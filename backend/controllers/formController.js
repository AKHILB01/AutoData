const { saveIdData } = require("../models/idmodel");
const tesseract = require("tesseract.js");
const fs = require("fs");

const uploadIdProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;

    // Extract text using OCR
    const { data: { text } } = await tesseract.recognize(filePath, "eng");

    // Simulated parsed data (use regex to parse from text)
    const parsedData = {
      full_name: "John Doe",
      dob: "1990-01-01",
      id_number: "ABC1234567",
      raw_text: text
    };

    const savedData = await saveIdData(parsedData);

    fs.unlinkSync(filePath); // delete temp file

    res.json({ message: "ID proof processed", data: savedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadIdProof };
