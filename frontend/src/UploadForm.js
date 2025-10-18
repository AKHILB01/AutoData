import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseurl } from "./utils";

function UploadForm({ onUploadSuccess, extracted }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState({
    full_name: "",
    dob: "",
    id_number: "",
    raw_text: "",
  });

  // Auto-fill fields when extracted data changes
  useEffect(() => {
    if (extracted) {
      setFields({
        full_name: extracted.full_name || "",
        dob: extracted.dob || "",
        id_number: extracted.id_number || "",
        raw_text: extracted.raw_text || "",
      });
    }
  }, [extracted]);

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file");
    const formData = new FormData();
    formData.append("idProof", file);

    try {
      const res = await axios.post(`${baseurl}/api/form/upload-id`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setMessage("Upload successful!");
      onUploadSuccess && onUploadSuccess(res.data.data);
    } catch (err) {
      setMessage(
        "Upload failed: " + (err.response?.data?.error || err.message)
      );
    }
  };

  // Allow manual editing of fields
  const handleFieldChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
      />
      <button type="submit">Upload & Extract</button>
      <div>{message}</div>
      <div style={{ marginTop: 16 }}>
        <label>
          Full Name:
          <input
            type="text"
            name="full_name"
            value={fields.full_name}
            onChange={handleFieldChange}
            autoComplete="off"
          />
        </label>
        <br />
        <label>
          Date of Birth:
          <input
            type="text"
            name="dob"
            value={fields.dob}
            onChange={handleFieldChange}
            autoComplete="off"
          />
        </label>
        <br />
        <label>
          ID Number:
          <input
            type="text"
            name="id_number"
            value={fields.id_number}
            onChange={handleFieldChange}
            autoComplete="off"
          />
        </label>
        <br />
        <label>
          Raw Text:
          <textarea
            name="raw_text"
            value={fields.raw_text}
            onChange={handleFieldChange}
            rows={4}
            style={{ width: "100%" }}
          />
        </label>
      </div>
    </form>
  );
}

export default UploadForm;
