const { saveIdData, getAllIdData } = require("../models/idmodel");
const tesseract = require("tesseract.js");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const uploadIdProof = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("Uploaded file type:", req.file.mimetype); // Add this line

    filePath = req.file.path;
    let text = "";

    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else {
      const result = await tesseract.recognize(filePath, "eng");
      text = result.data.text;
    }

    // Simulated parsed data (replace with actual parsing logic)
    const parsedData = {
      full_name: "John Doe",
      dob: "1990-01-01",
      id_number: "ABC1234567",
      raw_text: text
    };

    const savedData = await saveIdData(parsedData);

    res.json({ message: "ID proof processed", data: savedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    // Always remove the uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const getIdData = async (req, res) => {
  try {
    const data = await getAllIdData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadIdProof, getIdData };
