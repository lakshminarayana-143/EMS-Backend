// middleware/verifySignupAccess.js
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

export const verifySignupAccess = async (req, res, next) => {
  try {
    // ✅ Check if admin exists in DB
    const count = await Admin.countDocuments();
    console.log("🧩 [verifySignupAccess] Admin count:", count);

    // 🚀 If NO admin exists → allow registration directly
    if (count === 0) {
      console.log("✅ No admin found — skipping password check");
      return next();
    }

    // 🔐 If admin exists → check signup token
    const token = req.cookies.signup_token;
    console.log("🔍 Signup token present?", !!token);

    if (!token) {
      console.log("❌ No signup token — rejecting request");
      return res.status(401).json({ message: "Access denied: No signup token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🧾 Decoded signup token:", decoded);

    if (decoded.role !== "admin_temp") {
      console.log("❌ Invalid token role:", decoded.role);
      return res.status(403).json({ message: "Invalid signup token" });
    }

    console.log("✅ Signup token verified successfully");
    next();
  } catch (error) {
    console.error("❌ [verifySignupAccess] Error:", error);
    res.status(500).json({ message: "Server error verifying signup access" });
  }
};
