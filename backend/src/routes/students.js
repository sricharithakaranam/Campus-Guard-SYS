const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all students
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM students
      ORDER BY id ASC
    `);

    res.json({
      status: "ok",
      count: result.rows.length,
      students: result.rows,
    });
  } catch (error) {
    console.error("Error fetching students:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch students",
    });
  }
});

module.exports = router;