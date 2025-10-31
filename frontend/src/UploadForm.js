import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseurl } from "./utils";
import "./users/UploadForm.css"; // <-- add this import

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
    <form className="upload-form" onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
      />
      <br /><button type="submit">Upload & Extract</button><br />
      <div>{message}</div>
      <div style={{ marginTop: 16 }}>
        <label>
          Full Name:<br />
          <input
            type="text"
            name="full_name"
            value={fields.full_name}
            onChange={handleFieldChange}
            autoComplete="off"
            style={{ backgroundColor: "#f4f4f4ff", fontWeight: "bold" }}
          />
        </label>
        <br />
        <label>
          Date of Birth:<br />
          <input
            type="text"
            name="dob"
            value={fields.dob}
            onChange={handleFieldChange}
            autoComplete="off"
            style={{ backgroundColor: "#f4f4f4ff", fontWeight: "bold" }}
          />
        </label>
        <br />
        <label>
          Phone Number:<br />
          <input
            type="text"
            name="phone_number"
            value={fields.phone_number}
            onChange={handleFieldChange}
            autoComplete="off"
            style={{ backgroundColor: "#f4f4f4ff", fontWeight: "bold" }}
          />
        </label>
        <br />
        <label>
          Father name:<br />
          <input
            type="text"
            name="father_name"
            value={fields.father_name}
            onChange={handleFieldChange}
            autoComplete="off"
            style={{ backgroundColor: "#f4f4f4ff", fontWeight: "bold" }}
          />
        </label><br/>
        <label>
          Mother name:<br />
          <input
            type="text"
            name="mother_name"
            value={fields.mother_name}
            onChange={handleFieldChange}
            autoComplete="off"
            style={{ backgroundColor: "#f4f4f4ff", fontWeight: "bold" }}
          /><br/>
          </label>
        <label>
          present address:<br />
          <input
            type="text"
            name="present_address"
            value={fields.present_address}
            onChange={handleFieldChange}
            autoComplete="off"
            style={{ backgroundColor: "#f4f4f4ff", fontWeight: "bold" }}
          />
        </label>
        <br/>
        <label>
          permanent address:<br />
          <input
            type="text"
            name="permanent_address"
            value={fields.permanent_address}
            onChange={handleFieldChange}
            autoComplete="off"
            style={{ backgroundColor: "#f4f4f4ff", fontWeight: "bold" }}
          />
        </label>
        <button type="submit" >Submit</button>
      </div>
    </form>
  );
}

export default UploadForm;
