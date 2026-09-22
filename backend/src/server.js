const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const studentsRouter = require("./routes/students");
const faceRoutes = require("./routes/face");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "CampusGuard backend is running",
  });
});

app.use("/api/v1/students", studentsRouter);
app.use("/api/v1/face", faceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CampusGuard backend running on port ${PORT}`);
});