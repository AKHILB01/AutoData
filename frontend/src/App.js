import React, { useState } from "react";
import UploadForm from "./UploadForm";
import IdDataList from "./IdDataList";
import "./App.css";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [extracted, setExtracted] = useState(null);

  return (
    <div className="container">
      <h1>ID Data Extractor</h1>
      <UploadForm
        onUploadSuccess={data => {
          setExtracted(data);
          setRefresh(r => !r);
        }}
        extracted={extracted}
      />
      <IdDataList key={refresh} />
    </div>
  );
}

export default App;
