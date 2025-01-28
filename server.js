import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import typingTestRoutes from "./routes/typingroutes.js";
import redisClient from "./utils/redis.js"; // Import Redis client

const app = express();
const port = 8000;

// Middleware to parse JSON requests
app.use(express.json());

// User routes
app.use('/auth', authRoutes);
app.use('/test', typingTestRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to TypeArcade!");
});

// Redis connection log
redisClient.connect()
    .then(() => {
        console.log("Connected to Redis successfully!");
    })
    .catch((err) => {
        console.error("Redis connection failed:", err.message);
        process.exit(1); // Exit if Redis is critical to the app
    });

// MongoDB connection and server startup
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    });
