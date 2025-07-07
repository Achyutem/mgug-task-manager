const pool = require("../config/db");

// @desc    Get all users for assignment
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email FROM users");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getUsers,
};
