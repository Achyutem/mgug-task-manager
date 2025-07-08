const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

// Route to get all tasks and create a new task
router.route("/").get(protect, getTasks).post(protect, createTask);

// Route to update a task's main details
router.route("/:id").put(protect, updateTask);

// Route to update only a task's status
router.route("/:id/status").patch(protect, updateTaskStatus);

module.exports = router;
