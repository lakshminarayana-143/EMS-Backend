import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();


// -----------------------------------------------------
// ✅ CHECK AUTH
// -----------------------------------------------------
router.get("/check-auth", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Authenticated", admin: decoded });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});


// -----------------------------------------------------
// ✅ LOGIN ADMIN
// -----------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful", admin });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});


// -----------------------------------------------------
// ✅ REGISTER ADMIN + CREATE UNIQUE COLLECTION
// -----------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ email, password: hashed });
    await newAdmin.save();

    // -----------------------------------------------------
    // ⭐ NEW: CREATE A UNIQUE COLLECTION FOR THIS ADMIN
    // -----------------------------------------------------
    const collectionName = `employees_${newAdmin._id}`;
    await Admin.db.createCollection(collectionName);

    console.log(`📁 New collection created: ${collectionName}`);

    res.status(201).json({
      message: "Admin created successfully",
      adminId: newAdmin._id,
      collectionName,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating admin",
      error: error.message,
    });
  }
});


// -----------------------------------------------------
// ✅ LOGOUT ADMIN
// -----------------------------------------------------
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    console.log("👋 Admin logged out");
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
});


export default router;
