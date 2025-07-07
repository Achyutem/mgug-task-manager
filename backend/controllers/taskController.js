const pool = require("../config/db");

// @desc    Get all tasks (filtered)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date, t.created_at,
        assigner.id as assigner_id, assigner.name as assigner_name,
        assignee.id as assignee_id, assignee.name as assignee_name
      FROM tasks t
      JOIN users assigner ON t.assigner_id = assigner.id
      JOIN users assignee ON t.assignee_id = assignee.id
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await pool.query(query);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, priority, dueDate, assignee_id } = req.body;
  const assigner_id = req.user.id;

  if (!title || !priority || !dueDate || !assignee_id) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO tasks (title, description, priority, due_date, assigner_id, assignee_id) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, priority, dueDate, assigner_id, assignee_id]
    );

    const [newTask] = await pool.query("SELECT * FROM tasks WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;
  const userId = req.user.id;

  try {
    const [tasks] = await pool.query("SELECT * FROM tasks WHERE id = ?", [
      taskId,
    ]);
    const task = tasks[0];

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only the assignee can update the status
    if (task.assignee_id !== userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [
      status,
      taskId,
    ]);
    res.json({ message: "Task status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTaskStatus,
};
