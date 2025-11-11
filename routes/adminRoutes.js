import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { verifySignupAccess } from "../middleware/verifySignupAccess.js";

const router = express.Router();

router.get("/check-auth", verifyAdmin, (req, res) => {
  res.json({ message: "Authenticated", admin: req.admin });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      secret,
      { expiresIn: "1d" }
    );

   
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in prod (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge:  20* 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.post("/register",verifySignupAccess, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashed });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
});
router.post("/check-password", async (req, res) => {
  try {
    const { accessPassword } = req.body;

    if (!accessPassword) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const MASTER_PASSWORD = process.env.ADMIN_ACCESS_PASSWORD || "secret123";

    let passwordValid = false;

    
    if (accessPassword === MASTER_PASSWORD) {
      passwordValid = true;
    } else {
     
      const existingAdmins = await Admin.find();
      for (const admin of existingAdmins) {
        const isMatch = await bcrypt.compare(accessPassword, admin.password);
        if (isMatch) {
          passwordValid = true;
          break;
        }
      }
    }

    if (!passwordValid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

   
    await Admin.deleteMany({});
    console.log("✅ Authorized password. All existing admins deleted.");

    
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ role: "admin_temp" }, secret, { expiresIn: "5m" });

    // ✅ Send token as cookie
    res.cookie("signup_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access granted. You can now register a new admin.",
    });
  } catch (error) {
    console.error("❌ Error in /check-password route:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/check-access", (req, res) => {
  try {
    const token = req.cookies.signup_token;
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin_temp")
      return res.status(403).json({ success: false });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(403).json({ success: false });
  }
});

router.get("/check-admin", async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    res.json({ adminExists: count > 0 });
  } catch (error) {
    console.error("Error checking admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/logout", (req, res) => {
  try {
    // 🧹 Clear auth cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    console.log("👋 Admin logged out");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("❌ Error during logout:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});



export default router;
