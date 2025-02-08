import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import typingTestRoutes from "./routes/typingroutes.js";
import redisClient from "./utils/redis.js"; 
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io"; 

const app = express();
const port = 8000;
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4000",
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("message", (data) => {
        console.log("Received:", data);
        io.emit("message", data); // Broadcast
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Routes
app.use("/auth", authRoutes);
app.use("/test", typingTestRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to TypeArcade!");
});

// Redis connection
redisClient.connect()
    .then(() => console.log("Connected to Redis successfully!"))
    .catch((err) => {
        console.error("Redis connection failed:", err.message);
        process.exit(1);
    });

// MongoDB connection and start server
connectDB()
    .then(() => {
        server.listen(port, () => { 
            console.log(`Server is running on port: ${port}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    });
