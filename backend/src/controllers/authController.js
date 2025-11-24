// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const pool = require("../db");

// --- LOGIN ---
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email); // Debug log
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    //  PostgreSQL query - use $1 for parameterized queries
    const { rows } = await pool.query(
      `SELECT u.*, d.department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.department_id 
       WHERE email = $1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.status !== "Active") {
      return res.status(403).json({ message: "Your account is deactivated" });
    }

    // ✅ Make sure password_hash exists
    if (!user.password_hash) {
      console.error("⚠️ DB user has no password_hash:", user);
      return res.status(500).json({ message: "Server error: no password stored" });
    }

    // 🔑 Compare input password with stored hash
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

     //  Save session
    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      id_number: user.id_number,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      department_id: user.department_id,
      department_name: user.department_name
    };
  console.log("Session user set:", req.session.user); // Debug log

    const response = { 
      success: true,
      message: "Login successful", 
      user: req.session.user 
    };
    
    console.log("Sending response:", response); // Debug log
    res.json(response);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- LOGOUT ---
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

// --- PROFILE ---
const profile = (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
};

module.exports = { login, logout, profile };