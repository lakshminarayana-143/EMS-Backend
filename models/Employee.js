import mongoose from "mongoose";
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please enter a valid email address",
      ],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary must be a positive number"],
    },
    joinDate: {
      type: String,
      required: [true, "Join date is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // simple ISO date validation (YYYY-MM-DD)
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Join date must be in YYYY-MM-DD format",
      },
    },
  },
  { timestamps: true }
);




const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
