const pool = require("../db");

// CREATE Floor
const createFloor = async (req, res) => {
  const { block_id, floor_number, floor_name, description } = req.body;

  if (!block_id || !floor_number) {
    return res.status(400).json({ error: "Block ID and floor number are required" });
  }

  try {
    const insertResult = await pool.query(
      `INSERT INTO floors (block_id, floor_number, floor_name, description) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [block_id, floor_number, floor_name, description]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("Floor creation error:", err);

    if (err.code === "23505") {
      return res.status(409).json({ error: "Floor already exists in this block" });
    }

    if (err.code === "23503") {
      return res.status(404).json({ error: "Block not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// READ All Floors with Block Info
const getFloors = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.*, b.block_name, b.block_code 
       FROM floors f
       JOIN blocks b ON f.block_id = b.block_id
       ORDER BY b.block_name, f.floor_number`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Floors fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// READ Floors by Block ID
const getFloorsByBlock = async (req, res) => {
  const { blockId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT f.*, b.block_name, b.block_code 
       FROM floors f
       JOIN blocks b ON f.block_id = b.block_id
       WHERE f.block_id = $1
       ORDER BY f.floor_number`,
      [blockId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Floors by block fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE Floor
const updateFloor = async (req, res) => {
  const { id } = req.params;
  const { block_id, floor_number, floor_name, description } = req.body;

  try {
    const updateResult = await pool.query(
      `UPDATE floors 
       SET block_id = $1, floor_number = $2, floor_name = $3, description = $4 
       WHERE floor_id = $5 
       RETURNING *`,
      [block_id, floor_number, floor_name, description, id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Floor not found" });
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("Floor update error:", err);
    
    if (err.code === "23505") {
      return res.status(409).json({ error: "Floor already exists in this block" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// DELETE Floor
const deleteFloor = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResult = await pool.query(
      "DELETE FROM floors WHERE floor_id = $1",
      [id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Floor not found" });
    }

    res.json({ message: "Floor deleted successfully" });
  } catch (err) {
    console.error("Floor deletion error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createFloor,
  getFloors,
  getFloorsByBlock,
  updateFloor,
  deleteFloor
};