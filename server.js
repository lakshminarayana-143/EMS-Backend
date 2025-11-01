import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import router from "./routes/employeeRoutes.js";

dotenv.config();
connectDB();

const app = express();


app.use(
    cors({
        origin: 'http://localhost:5173', // ✅ Allow requests only from your React app
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Optional: restrict allowed methods

    })
);

app.use(express.json());
app.use('/',router);


app.get("/", (req, res) => {
    res.send("✅ Employee Management API is running...");
});


app.use("/api/employees", employeeRoutes);


app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
