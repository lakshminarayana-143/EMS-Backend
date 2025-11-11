import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies.token; // ✅ Get token from cookie

    if (!token) {
      return res.status(401).json({ message: "No token provided. Unauthorized." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    const decoded = jwt.verify(token, secret); // ✅ Verify token
    req.admin = decoded; // attach admin info to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
