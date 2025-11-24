const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
// Middlewares
app.use(cors({
  origin: "http://localhost:3000", // Next.js frontend
  credentials: true,
}));
app.use(bodyParser.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "mysecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // set true only on HTTPS
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
// routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const depRoutes = require("./src/routes/depRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const scheduleRoutes = require("./src/routes/sheduleRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const announceRoute = require("./src/routes/announceRoutes");
const blockRoutes = require("./src/routes/blockRoute");
const floorRoutes = require("./src/routes/floorRoute");
const roomRoutes = require("./src/routes/roomRoutes");
const batchRoutes = require('./src/routes/batchRoutes');
const semesterRoutes = require('./src/routes/routeSemester');

app.use("/api/auth", authRoutes);  // /api/login
app.use("/api/users", userRoutes); // /api/users
app.use("/api/departments", depRoutes); // /api/department
app.use("/api/courses", courseRoutes);  // /api/courses
app.use("/api/schedules", scheduleRoutes);  // /api/courses
app.use("/api/feedback", feedbackRoutes);  // /api/feedback
app.use("/api/announcements", announceRoute);  // /api/announcements
app.use("/api/blocks", blockRoutes); // /api/blocks
app.use("/api/floors", floorRoutes); // /api/floors
app.use("/api/rooms", roomRoutes); // /api/rooms
app.use('/api/batches', batchRoutes);
app.use('/api/semesters', semesterRoutes);

app.get("/", (_req, res) => {
    console.log("API running");
    res.send("API running")
});

app.use((req, res) => res.status(404).send("Route not found"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));









