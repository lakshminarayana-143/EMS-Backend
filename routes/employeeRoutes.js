import express from "express";
import Employee from "../models/Employee.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all employees
router.get("/",verifyAdmin, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error });
  }
});

// Add employee
router.post("/", verifyAdmin,async (req, res) => {
  try {
    const { name, email, department, position, salary, joinDate } = req.body;
    if (!name || !email || !department || !position || !salary || !joinDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newEmployee = new Employee({
      name,
      email,
      department,
      position,
      salary,
      joinDate,
    });

    const saved = await newEmployee.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error adding employee", error });
  }
});

// Update employee
router.put("/:id",verifyAdmin, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error });
  }
});

// Delete employee
router.delete("/:id",verifyAdmin ,async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error });
  }
});

export default router;
