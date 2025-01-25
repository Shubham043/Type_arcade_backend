import express from "express";
import { leaderBoard, startTest, submitTest } from "../controllers/typingcontroller.js";
import authmiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

// Typing test routes
router.get('/starttest', authmiddleware, startTest);  
router.post('/submittest', authmiddleware, submitTest);  
router.get('/leaderboard',authmiddleware,leaderBoard)

export default router;
