const pool = require("../db");

// Get all courses with department info
const getCourse = async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM Course`);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  try {
    const { course_code, course_name, credit_hour, category } = req.body;
    if (!course_code || !course_name.trim() || !credit_hour || !category) {
      return res.status(400).json({ error: "All course fields are required" });
    }

    // Insert course and return new ID
    const insertResult = await pool.query(
      `INSERT INTO Course (course_code, course_name, credit_hour, category) 
       VALUES ($1, $2, $3, $4) 
       RETURNING course_id`,
      [course_code, course_name, credit_hour, category]
    );

    const newCourseId = insertResult.rows[0].course_id;

    // Fetch the newly created course with department info
    const { rows } = await pool.query(
      `SELECT * FROM Course  WHERE course_id = $1`,
      [newCourseId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/course error:", err);
    if (err.code === "23505") {
      // unique_violation
      return res.status(409).json({ error: "Course with this code already exists" });
    }
    res.status(500).json({ error: "Failed to create course" });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { course_code, course_name, credit_hour, category } = req.body;

    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ error: "Invalid id" });
    if (!course_code || !course_name || !credit_hour)
      return res.status(400).json({ error: "All fields are required" });

    const updateResult = await pool.query(
      `UPDATE Course 
       SET course_code = $1, course_name = $2, credit_hour = $3, category = $4 
       WHERE course_id = $5 
       RETURNING *`,
      [course_code, course_name, credit_hour, category, id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("PUT /api/course/:id error:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Course with this code already exists" });
    }
    res.status(500).json({ error: "Failed to update course" });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ error: "Invalid id" });

    const deleteResult = await pool.query(
      "DELETE FROM Course WHERE course_id = $1",
      [id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    console.error("DELETE /api/course/:id error:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

module.exports = { getCourse, createCourse, updateCourse, deleteCourse };
