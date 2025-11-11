import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import router from "./routes/employeeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";


dotenv.config();
connectDB();

const app = express();


app.use(
    cors({
        origin: 'http://localhost:5173', 
        credentials : true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'], 

    })
);

app.use(express.json());
app.use(cookieParser());
app.use('/',router);


app.get("/", (req, res) => {
    res.send("✅ Employee Management API is running...");
});


app.use("/api/employees", employeeRoutes);
app.use("/api/admin", adminRoutes);


app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
