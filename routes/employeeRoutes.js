import express from "express";
import Admin from "../models/Admin.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * Helper: Get dynamic collection for an admin
 */
const getEmployeeCollection = (adminId) => {
  const collectionName = `employees_${adminId}`;
  return Admin.db.collection(collectionName);
};

/**
 * -----------------------------------------------------
 * GET all employees for logged-in admin
 * -----------------------------------------------------
 */
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const Employees = getEmployeeCollection(adminId);

    const employees = await Employees.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(employees);

  } catch (error) {
    console.error("Fetch employees error:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

/**
 * -----------------------------------------------------
 * ADD new employee
 * -----------------------------------------------------
 */
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const Employees = getEmployeeCollection(adminId);

    const { name, email, department, position, salary, joinDate } = req.body;

    // Required fields check
    if (!name || !email || !department || !position || !salary || !joinDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email uniqueness for same admin
    const existing = await Employees.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const newEmployee = {
      name,
      email,
      department,
      position,
      salary,
      joinDate,
      createdAt: new Date(),
    };

    const result = await Employees.insertOne(newEmployee);

    res.status(201).json({ _id: result.insertedId, ...newEmployee });

  } catch (error) {
    console.error("Add employee error:", error);
    res.status(500).json({ message: "Error adding employee" });
  }
});

/**
 * -----------------------------------------------------
 * UPDATE employee
 * -----------------------------------------------------
 */
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const Employees = getEmployeeCollection(adminId);

    const updateData = req.body;
    const { id } = req.params;

    const result = await Employees.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(result.value);

  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ message: "Error updating employee" });
  }
});

/**
 * -----------------------------------------------------
 * DELETE employee
 * -----------------------------------------------------
 */
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const Employees = getEmployeeCollection(adminId);

    const { id } = req.params;

    const result = await Employees.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted" });

  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ message: "Error deleting employee" });
  }
});

export default router;
