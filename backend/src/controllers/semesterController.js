const pool = require("../db");

// Get all semesters for department
const getAllSemesters = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        b.batch_year,
        d.department_name
      FROM semesters s
      LEFT JOIN batches b ON s.batch_id = b.batch_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      ORDER BY s.academic_year DESC, s.start_date DESC
    `;

    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching semesters:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch semesters" 
    });
  }
};

// Get semester by ID
const getSemesterById = async (req, res) => {
  try {
    const { id } = req.params;    
    const query = `
      SELECT 
        s.*,
        b.batch_year,
        d.department_name
      FROM semesters s
      LEFT JOIN batches b ON s.batch_id = b.batch_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE s.id = $1 
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Semester not found" 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error fetching semester:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch semester" 
    });
  }
};

// Create new semester
const createSemester = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { semester, batch_id, academic_year, start_date, end_date, status, department_id } = req.body;

    // Validation
    if (!semester || !batch_id || !academic_year || !start_date || !end_date || !department_id) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields are required" 
      });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({ 
        success: false, 
        error: "End date must be after start date" 
      });
    }

    // Validate academic year format (YYYY-YYYY)
    const academicYearRegex = /^\d{4}-\d{4}$/;
    if (!academicYearRegex.test(academic_year)) {
      return res.status(400).json({ 
        success: false, 
        error: "Academic year must be in format: YYYY-YYYY (e.g., 2023-2024)" 
      });
    }

   

    await client.query('BEGIN');

    // Check if semester already exists in department (based on unique constraint)
    const existingSemester = await client.query(
      `SELECT * FROM semesters 
       WHERE semester = $1 AND academic_year = $2 AND department_id = $3 AND batch_id = $4`,
      [semester, academic_year, department_id, batch_id]
    );

    if (existingSemester.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: "Semester with this name, academic year, and batch already exists in your department" 
      });
    }

    // Verify batch exists
    const batchExists = await client.query(
      "SELECT * FROM batches WHERE batch_id = $1",
      [batch_id]
    );

    if (batchExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: "Selected batch does not exist" 
      });
    }

    // Verify department exists
    const departmentExists = await client.query(
      "SELECT * FROM departments WHERE department_id = $1",
      [department_id]
    );

    if (departmentExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: "Selected department does not exist" 
      });
    }

    // Create semester
    const result = await client.query(
      `INSERT INTO semesters (semester, batch_id, academic_year, start_date, end_date, department_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *,
         (SELECT batch_year FROM batches WHERE batch_id = $2) as batch_year,
         (SELECT department_name FROM departments WHERE department_id = $6) as department_name`,
      [semester, batch_id, academic_year, start_date, end_date, department_id, status || 'active']
    );

    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: "Semester created successfully",
      data: result.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating semester:", err);
    
    // Handle unique constraint violation
    if (err.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        error: "Semester with this name and academic year already exists in your department" 
      });
    }
    
    // Handle foreign key violations
    if (err.code === '23503') {
      if (err.constraint === 'semesters_batch_id_fkey') {
        return res.status(400).json({ 
          success: false, 
          error: "Selected batch does not exist" 
        });
      }
      if (err.constraint === 'semesters_department_id_fkey') {
        return res.status(400).json({ 
          success: false, 
          error: "Selected department does not exist" 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to create semester" 
    });
  } finally {
    client.release();
  }
};
// Update semester
const updateSemester = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { semester, batch_id, academic_year, start_date, end_date, status, department_id } = req.body;

    await client.query('BEGIN');

    // Check if semester exists
    const existingSemester = await client.query(
      "SELECT * FROM semesters WHERE id = $1",
      [id]
    );

    if (existingSemester.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        error: "Semester not found" 
      });
    }

    // Check for duplicate semester name and academic year
    const duplicateSemester = await client.query(
      `SELECT * FROM semesters 
       WHERE semester = $1 AND academic_year = $2 AND department_id = $3 AND batch_id = $4 AND id != $5`,
      [
        semester || existingSemester.rows[0].semester,
        academic_year || existingSemester.rows[0].academic_year,
        department_id || existingSemester.rows[0].department_id,
        batch_id || existingSemester.rows[0].batch_id,
        id
      ]
    );

    if (duplicateSemester.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: "Semester with this name, academic year, and batch already exists in your department" 
      });
    }

    // Validate academic year format if provided
    if (academic_year) {
      const academicYearRegex = /^\d{4}-\d{4}$/;
      if (!academicYearRegex.test(academic_year)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: "Academic year must be in format: YYYY-YYYY (e.g., 2023-2024)" 
        });
      }
    }

    // Validate dates if provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate >= endDate) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: "End date must be after start date" 
        });
      }
    }

    // Verify batch exists if changing
    if (batch_id && batch_id !== existingSemester.rows[0].batch_id) {
      const batchExists = await client.query(
        "SELECT * FROM batches WHERE batch_id = $1",
        [batch_id]
      );

      if (batchExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: "Selected batch does not exist" 
        });
      }
    }

    // Verify department exists if changing
    const targetDepartmentId = department_id || existingSemester.rows[0].department_id;
    if (department_id && department_id !== existingSemester.rows[0].department_id) {
      const departmentExists = await client.query(
        "SELECT * FROM departments WHERE department_id = $1",
        [department_id]
      );

      if (departmentExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: "Selected department does not exist" 
        });
      }
    }

    // Update semester
    const result = await client.query(
      `UPDATE semesters 
       SET 
         semester = $1,
         batch_id = $2,
         academic_year = $3,
         start_date = $4,
         end_date = $5,
         status = $6,
         department_id = $7,
         updated_at = NOW() 
       WHERE id = $8  
       RETURNING *,
         (SELECT batch_year FROM batches WHERE batch_id = $2) as batch_year,
         (SELECT department_name FROM departments WHERE department_id = $7) as department_name`,
      [
        semester || existingSemester.rows[0].semester,
        batch_id || existingSemester.rows[0].batch_id,
        academic_year || existingSemester.rows[0].academic_year,
        start_date || existingSemester.rows[0].start_date,
        end_date || existingSemester.rows[0].end_date,
        status || existingSemester.rows[0].status,
        department_id || existingSemester.rows[0].department_id,
        id,
      ]
    );

    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: "Semester updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating semester:", err);
    
    // Handle unique constraint violation
    if (err.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        error: "Semester with this name, academic year, and batch already exists in your department" 
      });
    }
    
    // Handle foreign key violations
    if (err.code === '23503') {
      if (err.constraint === 'semesters_batch_id_fkey') {
        return res.status(400).json({ 
          success: false, 
          error: "Selected batch does not exist" 
        });
      }
      if (err.constraint === 'semesters_department_id_fkey') {
        return res.status(400).json({ 
          success: false, 
          error: "Selected department does not exist" 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to update semester" 
    });
  } finally {
    client.release();
  }
};

// Delete semester
const deleteSemester = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Check if semester exists and belongs to department
    const semester = await client.query(
      "SELECT * FROM semesters WHERE id = $1 ",
      [id]
    );

    if (semester.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        error: "Semester not found" 
      });
    }

    // Check if semester is used in any schedules
    const scheduleCount = await client.query(
      "SELECT COUNT(*) FROM schedules WHERE id = $1",
      [id]
    );

    if (parseInt(scheduleCount.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: "Cannot delete semester. It is being used in existing schedules." 
      });
    }

    // Delete semester
    await client.query(
      "DELETE FROM semesters WHERE id = $1",
      [id]
    );

    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: "Semester deleted successfully"
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error deleting semester:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete semester" 
    });
  } finally {
    client.release();
  }
};

// Get semesters by batch
const getSemestersByBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        b.batch_year,
        d.department_name
      FROM semesters s
      LEFT JOIN batches b ON s.batch_id = b.batch_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE s.batch_id = $1 AND  
      ORDER BY s.academic_year DESC, s.semester DESC
    `;

    const result = await pool.query(query, [batch_id]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching semesters by batch:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch semesters" 
    });
  }
};

// Get active semesters for department
const getActiveSemesters = async (req, res) => {
  try {    
    const query = `
      SELECT 
        s.*,
        b.batch_year,
        d.department_name
      FROM semesters s
      LEFT JOIN batches b ON s.batch_id = b.batch_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE s.department_id = $1 AND s.status = 'active'
      ORDER BY s.academic_year DESC, s.semester DESC
    `;

    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching active semesters:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch active semesters" 
    });
  }
};

// Get current semester (active semester with current date within range)
const getCurrentSemester = async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const query = `
      SELECT 
        s.*,
        b.batch_year,
        d.department_name
      FROM semesters s
      LEFT JOIN batches b ON s.batch_id = b.batch_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE  s.status = 'active'
        AND $2 BETWEEN s.start_date AND s.end_date
      ORDER BY s.start_date DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [currentDate]);
    
    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (err) {
    console.error("Error fetching current semester:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch current semester" 
    });
  }
};

module.exports = {
  getAllSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
  getSemestersByBatch,
  getActiveSemesters,
  getCurrentSemester
};