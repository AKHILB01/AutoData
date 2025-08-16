const express = require("express");
const cors = require("cors");
const formRoutes = require("./routes/formRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/form", formRoutes);

module.exports = app;
