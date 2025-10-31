import React, { useState } from "react";
import UploadForm from "./UploadForm";
import "./App.css";

function App() {
  const [extracted, setExtracted] = useState(null);

  return (
    <div className="container"
    style={{ textAlign: "center" ,
      backgroundColor: "#89d9f6ff",
    }}><br/>
      <h1>Fill the data by uploading a file</h1>
      <UploadForm
        onUploadSuccess={data => {
          setExtracted(data);
        }}
        extracted={extracted}
      />
    </div>
  );
}

export default App;
