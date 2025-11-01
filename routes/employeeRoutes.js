import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error });
  }
});


router.post("/", async (req, res) => {
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

    const savedEmployee = await newEmployee.save();
    
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(500).json({ message: "Error adding employee", error });
    console.log(error);
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { name, email, department, position, salary, joinDate } = req.body;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, department, position, salary, joinDate },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error });
  }
});

export default router;
