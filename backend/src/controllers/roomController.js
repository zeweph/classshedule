const pool = require("../db");

// CREATE Room
const createRoom = async (req, res) => {
  const { 
    floor_id, 
    room_number, 
    room_name, 
    room_type, 
    capacity, 
    facilities, 
    is_available 
  } = req.body;

  if (!floor_id || !room_number || !room_type) {
    return res.status(400).json({ error: "Floor ID, room number, and room type are required" });
  }

  try {
    const insertResult = await pool.query(
      `INSERT INTO rooms (floor_id, room_number, room_name, room_type, capacity, facilities, is_available) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [floor_id, room_number, room_name, room_type, capacity, facilities || [], is_available !== false]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("Room creation error:", err);

    if (err.code === "23505") {
      return res.status(409).json({ error: "Room already exists on this floor" });
    }

    if (err.code === "23503") {
      return res.status(404).json({ error: "Floor not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// READ All Rooms with Block and Floor Info
const getRooms = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        r.*, 
        f.floor_number,
        f.floor_name,
        b.block_name,
        b.block_code
       FROM rooms r
       JOIN floors f ON r.floor_id = f.floor_id
       JOIN blocks b ON f.block_id = b.block_id
       ORDER BY b.block_name, f.floor_number, r.room_number`
    );
    console.log("Rooms fetched:", rows.length); // Debug log
    res.status(200).json(rows);
  } catch (err) {
    console.error("Rooms fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// READ Room by ID - FIXED: Changed r.id to r.room_id
const getRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT 
        r.*, 
        f.floor_number,
        f.floor_name,
        b.block_name,
        b.block_code
       FROM rooms r
       JOIN floors f ON r.floor_id = f.floor_id
       JOIN blocks b ON f.block_id = b.block_id
       WHERE r.room_id = $1`, // CHANGED: r.id to r.room_id
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Room fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// READ Rooms by Floor ID
const getRoomsByFloor = async (req, res) => {
  const { floorId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT 
        r.*, 
        f.floor_number,
        f.floor_name,
        b.block_name,
        b.block_code
       FROM rooms r
       JOIN floors f ON r.floor_id = f.floor_id
       JOIN blocks b ON f.block_id = b.block_id
       WHERE r.floor_id = $1
       ORDER BY r.room_number`,
      [floorId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Rooms by floor fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE Room
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { 
    floor_id, 
    room_number, 
    room_name, 
    room_type, 
    capacity, 
    facilities, 
    is_available 
  } = req.body;

  try {
    const updateResult = await pool.query(
      `UPDATE rooms 
       SET floor_id = $1, room_number = $2, room_name = $3, room_type = $4, 
           capacity = $5, facilities = $6, is_available = $7
       WHERE room_id = $8 
       RETURNING *`,
      [floor_id, room_number, room_name, room_type, capacity, facilities, is_available, id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("Room update error:", err);
    
    if (err.code === "23505") {
      return res.status(409).json({ error: "Room already exists on this floor" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// DELETE Room
const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResult = await pool.query(
      "DELETE FROM rooms WHERE room_id = $1",
      [id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Room deletion error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  getRoomsByFloor,
  updateRoom,
  deleteRoom
};