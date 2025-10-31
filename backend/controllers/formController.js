const { saveIdData, getAllIdData } = require("../models/idmodel");
const tesseract = require("tesseract.js");
const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Heuristic parser: extracts common fields from raw OCR/pdf text.
 * Improves resilience so frontend form changes don't affect extraction.
 */
function parseTextToFields(text = "") {
  const normalized = text.replace(/\r/g, "\n");
  const lines = normalized
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const joinAll = (arr, from) => {
    if (!arr || arr.length === 0) return "";
    return arr.slice(from || 0).join(" ");
  };

  // Helper: search labelled value like "Name: John Doe"
  const findLabel = (labels) => {
    for (const line of lines) {
      for (const label of labels) {
        const re = new RegExp(label + '\\s*[:\\-]?\\s*(.+)', 'i');
        const m = line.match(re);
        if (m && m[1]) return m[1].trim();
      }
    }
    return "";
  };

  // 1) Name detection (labelled or best-effort first plausible name line)
  let full_name = findLabel(["Full Name", "Name", "नाम", "नांव", "Applicant Name", "Name of", "Candidate Name"]);
  if (!full_name) {
    // fallback: first line with 2+ words and letters (not numeric)
    for (const line of lines) {
      if (/^[A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F\s.'-]{2,}$/.test(line) && line.split(/\s+/).length >= 2) {
        // avoid lines that look like labels (contain ':' or 'DOB' etc)
        if (!/[:|.]/.test(line) || /^[A-Za-z\s.'-]{3,}$/.test(line)) {
          full_name = line;
          break;
        }
      }
    }
  }

  // 2) DOB detection (common formats)
  let dob = "";
  const dobMatch = text.match(/(\b[0-3]?\d[\/\-\.][0-1]?\d[\/\-\.](?:19|20)\d{2}\b)|(\b(?:19|20)\d{2}[\/\-\.][0-1]?\d[\/\-\.][0-3]?\d\b)/);
  if (dobMatch) dob = dobMatch[0];

  // 3) Phone number (10 digits, with optional country code)
  let phone_number = "";
  const phoneMatch = text.match(/(\+?\d{1,3}[-\s]?)?((?:\d[\s-]?){10,12})/);
  if (phoneMatch) {
    const candidate = phoneMatch[2].replace(/[\s-]/g, "");
    if (candidate.length >= 10 && candidate.length <= 12) phone_number = candidate;
  }

  // 4) ID numbers: Aadhar (12 digits) or PAN (5 letters + 4 digits + 1 letter) or generic alphanumeric
  let id_number = "";
  const pan = text.match(/\b([A-Z]{5}\d{4}[A-Z])\b/);
  const aadhar = text.match(/\b(\d{4}\s*\d{4}\s*\d{4})\b/);
  const aadharCompact = text.match(/\b(\d{12})\b/);
  if (pan) id_number = pan[1];
  else if (aadhar) id_number = aadhar[1].replace(/\s+/g, "");
  else if (aadharCompact) id_number = aadharCompact[1];
  else {
    // fallback: first alphanumeric token of length 6-15 that looks like an ID
    const token = text.match(/\b([A-Z0-9\-\/]{6,15})\b/);
    if (token) id_number = token[1];
  }

  // 5) Parent names (labelled)
  const father_name = findLabel(["Father's Name", "Father Name", "Father", "पिता का नाम", "पिता"]);
  const mother_name = findLabel(["Mother's Name", "Mother Name", "Mother", "माता का नाम", "माता"]);

  // 6) Addresses: capture lines after Address label until next labeled field or blank
  const extractAddress = (labels) => {
    for (let i = 0; i < lines.length; i++) {
      for (const label of labels) {
        if (new RegExp('^' + label + '\\b', 'i').test(lines[i])) {
          // collect next up to 4 lines as address
          const parts = [];
          for (let j = i; j < Math.min(lines.length, i + 5); j++) {
            if (/^(Name|DOB|Date of Birth|Father|Mother|ID|PAN|Aadhar|Phone|Mobile|Email)\b/i.test(lines[j])) break;
            parts.push(lines[j]);
          }
          return parts.join(" ");
        }
      }
    }
    return "";
  };

  const present_address = extractAddress(["Present Address", "Address", "Current Address", "Present"]);
  const permanent_address = extractAddress(["Permanent Address", "Permanent", "Res Address", "Residential Address"]);

  // 7) raw_text included
  const raw_text = text;

  return {
    full_name: full_name || "",
    dob: dob || "",
    id_number: id_number || "",
    phone_number: phone_number || "",
    father_name: father_name || "",
    mother_name: mother_name || "",
    present_address: present_address || "",
    permanent_address: permanent_address || "",
    raw_text,
  };
}

const uploadIdProof = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("Uploaded file type:", req.file.mimetype);

    filePath = req.file.path;
    let text = "";

    if (req.file.mimetype === "application/pdf" || req.file.originalname?.toLowerCase().endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text || "";
    } else {
      // tesseract recognizes from path; use english by default
      const result = await tesseract.recognize(filePath, "eng");
      text = (result && result.data && result.data.text) ? result.data.text : "";
    }

    console.log("OCR / PDF text preview:", (text || "").slice(0, 500));

    // Parse fields from OCR/text — independent of frontend form inputs
    const parsedData = parseTextToFields(text);

    // Save parsed data (model handles DB insert)
    const savedData = await saveIdData(parsedData);

    // Return parsed + saved record
    res.json({ message: "ID proof processed", data: savedData });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Processing error" });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore cleanup errors */ }
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
