import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import typingTestRoutes from "./routes/typingroutes.js";

const app = express();
const port = 8000;

// Middleware to parse JSON requests
app.use(express.json());

 // User routes
 app.use('/auth', authRoutes); 

 // Typing test routes
 app.use('/test', typingTestRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to TypeArcade!");
});

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
