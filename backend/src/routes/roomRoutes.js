const express = require("express");
const router = express.Router();
const { 
  createRoom, 
  getRooms, 
  updateRoom, 
  deleteRoom,
  getRoomById,
  getRoomsByFloor 
} = require("../controllers/roomController");

// CRUD routes for rooms
router.post("/", createRoom);
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.get("/floor/:floorId", getRoomsByFloor);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;