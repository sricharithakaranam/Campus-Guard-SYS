const express = require("express");
const router = express.Router();
const pool = require("../db");

// Register face data for a student
router.post("/register", async (req, res) => {
  try {
    const {
      student_id,
      template_reference,
      model_version,
      quality_score,
    } = req.body;

    if (!student_id || !template_reference || !model_version) {
      return res.status(400).json({
        message:
          "student_id, template_reference and model_version are required",
      });
    }

    const student = await pool.query(
      "SELECT id, roll_no, name FROM students WHERE id = $1",
      [student_id]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const result = await pool.query(
      `INSERT INTO face_data
        (student_id, template_reference, model_version, quality_score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id)
       DO UPDATE SET
         template_reference = EXCLUDED.template_reference,
         model_version = EXCLUDED.model_version,
         quality_score = EXCLUDED.quality_score,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        student_id,
        template_reference,
        model_version,
        quality_score || null,
      ]
    );

    res.status(201).json({
      message: "Face registered successfully",
      student: student.rows[0],
      face_data: result.rows[0],
    });
  } catch (error) {
    console.error("Face registration error:", error);

    res.status(500).json({
      message: "Failed to register face",
    });
  }
});

module.exports = router;