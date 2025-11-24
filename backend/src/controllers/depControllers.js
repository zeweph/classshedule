const pool = require("../db");

const getDep = async (req, res) => {

  try {
    const { rows  } = await pool.query(
      "SELECT d.department_id, d.department_name, d.head_id, u.full_name AS head_name FROM departments d LEFT JOIN users u ON d.head_id = u.id"
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/departments error:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
  
}

const getDepHitory = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT d.department_id, d.department_name, d.head_id, u.full_name AS head_name, lastdate_at FROM departments_history d LEFT JOIN users u ON d.head_id = u.id"
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/departments/his error:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

const createDep = async (req, res) => {
  try {
    const { department_name } = req.body;
    if (!department_name || !department_name.trim()) {
      return res.status(400).json({ error: 'department_name is required' });
    }

    const { rows } = await pool.query(
      'INSERT INTO departments (department_name) VALUES ($1) RETURNING department_id, department_name',
      [department_name.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/departments error:', err);
    if (err.code === '23505') { // PostgreSQL unique violation error code
      return res.status(409).json({ error: 'Department with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create department' });
  }
}

const updateDep = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { department_name } = req.body;
    
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
    if (!department_name || !department_name.trim()) return res.status(400).json({ error: 'department_name is required' });

    const { rows, rowCount } = await pool.query(
      'UPDATE departments SET department_name = $1 WHERE department_id = $2 RETURNING department_id, department_name',
      [department_name.trim(), id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/departments/:id error:', err);
    if (err.code === '23505') { // PostgreSQL unique violation error code
      return res.status(409).json({ error: 'Department with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update department' });
  }
}

const deleteDep = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const { rowCount } = await pool.query(
      'DELETE FROM departments WHERE department_id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    console.error('DELETE /api/departments/:id error:', err);
    res.status(500).json({ error: 'Failed to delete department' });
  }
}
const updateHeadId = async (req, res) => {
  const { id } = req.params;
  const { head_id } = req.body;
  try {
    // Validate input
    if (!head_id) {
      return res.status(400).json({ message: "head_id is required" });
    }
    // Fetch instructor and department in parallel for better performance
    const instructorQuery = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [head_id]
    );
    const departmentQuery = await pool.query(
      "SELECT * FROM departments WHERE department_id = $1",
      [id]
    );
    const FetchInstructor = instructorQuery.rows;
    const depOldFetch = departmentQuery.rows;
    // Check if instructor exists
    if (FetchInstructor.length === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    // Check if department exists
    if (depOldFetch.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    // FIXED: Proper validation - check if instructor belongs to this department
    if (FetchInstructor[0].department_id !== parseInt(id)) {
      return res.status(400).json({ 
        message: `Instructor ${FetchInstructor[0].full_name} is not assigned to ${depOldFetch[0].department_name} department` 
      });
    }
    // Handle previous department head if exists
    if (depOldFetch[0].head_id !== null) {
      // Archive previous department head
      await pool.query(
        'INSERT INTO departments_history (department_id, department_name, created_at, updated_at, head_id) VALUES ($1, $2, $3, $4, $5)',
        [
          depOldFetch[0].department_id,
          depOldFetch[0].department_name,
          depOldFetch[0].created_at,
          depOldFetch[0].updated_at,
          depOldFetch[0].head_id,
        ]
      );
      
      // Demote previous head to instructor
      const role = "instructor";
      const result = await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        [role, depOldFetch[0].head_id]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Previous department head not found" });
      }
    }

    // Update department with new head
    await pool.query(
      "UPDATE departments SET head_id = $1, updated_at = NOW() WHERE department_id = $2", 
      [head_id, id]
    );

    // Promote new head
    const role1 = "department_head";
    const result1 = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role1, head_id]
    );

    if (result1.rowCount === 0) {
      return res.status(404).json({ message: "New department head not found" });
    }

    // Fetch updated department with head information
    const updatedQuery = await pool.query(`
      SELECT d.department_id, d.department_name, d.head_id, u.full_name AS head_name
      FROM departments d
      LEFT JOIN users u ON d.head_id = u.id
      WHERE d.department_id = $1
    `, [id]);

    res.json(updatedQuery.rows[0]);

  } catch (error) {
    console.error("Error updating department head:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getDep, getDepHitory, createDep, updateDep, deleteDep, updateHeadId }