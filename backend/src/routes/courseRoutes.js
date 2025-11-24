const express = require("express");
const router = express.Router();
const { getCourse,createCourse,updateCourse,deleteCourse} = require("../controllers/courseController");

// CRUD routes for rooms
router.post("/", createCourse);
router.get("/", getCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
