import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
connectDB();

const app = express();

// ---------------------------------------------------
// ✅ FIXED — Bullet-proof CORS for Render + Cookies
// ---------------------------------------------------
const allowedOrigins = [
  "http://localhost:5174",
  "https://ems-frontend7.onrender.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // 🔥 Required to pass preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ---------------------------------------------------
// Middleware
// ---------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------------
// Test Route
// ---------------------------------------------------
app.get("/", (req, res) => {
  res.send("✅ Employee Management API is running...");
});

// ---------------------------------------------------
// Routes
// ---------------------------------------------------
app.use("/api/admin", adminRoutes);
app.use("/api/employees", employeeRoutes);

// ---------------------------------------------------
// 404 Handler
// ---------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ---------------------------------------------------
// Start Server
// ---------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
