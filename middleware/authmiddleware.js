import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv(); 

const authmiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log(decoded);
        
        req.body.user = decoded; 
        next(); 
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

export default authmiddleware;
