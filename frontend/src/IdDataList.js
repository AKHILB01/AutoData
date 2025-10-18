import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseurl } from "./utils";

function IdDataList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${baseurl}/api/form/data`, { withCredentials: true })
      .then(res => setData(res.data))
      .catch(() => setData([]));
  }, []);

  return (
    <div>
      <h2>Extracted ID Data</h2>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <strong>Name:</strong> {item.full_name} <br />
            <strong>DOB:</strong> {item.dob} <br />
            <strong>ID Number:</strong> {item.id_number} <br />
            <details>
              <summary>Raw Text</summary>
              <pre>{item.raw_text}</pre>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IdDataList;