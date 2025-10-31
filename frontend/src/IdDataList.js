import { useEffect, useState } from "react";
import axios from "axios";
import { baseurl } from "./utils";

function IdDataList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${baseurl}/api/form/data`, { withCredentials: true })
      .then(res => setData(res.data))
      .catch(() => setData([]));
  }, []);
  // render or return null if you deleted this component from App
}

export default function IdDataList() {
  return null; // no UI — keeps file present without warnings
}