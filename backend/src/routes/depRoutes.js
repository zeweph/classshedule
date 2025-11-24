// src/routes/depRoutes.js
const express = require("express");
const router = express.Router();
const {
     getDep,
    createDep,
    updateDep,
    deleteDep ,
    updateHeadId} = require("../controllers/depControllers");
router.get("/", getDep);
router.post("/", createDep);
router.put("/:id", updateDep);
router.put("/:id/head", updateHeadId);

router.delete("/:id", deleteDep);


module.exports = router;