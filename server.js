import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
app.use(cors())

dotenv.config();
connectDB();

const app = express();


app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("✅ Employee Management API is running...");
});

// Public admin routes (signup, login)
app.use("/api/admin", adminRoutes);

// Protected employee routes
app.use("/api/employees", employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
