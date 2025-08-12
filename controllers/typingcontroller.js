import axios from "axios";
import typingTestSchema from "../models/typingtest.js";
import mongoose from "mongoose";
import redisClient from "../utils/redis.js";
import User from "../models/user.js";

// Start test controller
export const startTest = async (req, res) => {
    try {
        const { duration = 15 } = req.body; 
        const user = req.body.user; 

        if (!user) {
            return res.status(403).json({ error: "Authentication failed" });
        }

        // Fetch mainText from an API
        let mainText = "All I dream of is your eyes, all I long for is your touch.";
        try {
            const response = await axios.get("https://zenquotes.io/api/random");

            mainText = response.data[0].q; 
            console.log(mainText);
            // Extract the quote
        } catch (apiError) {
            console.error("Failed to fetch mainText from API, using default text.", apiError.message);
        }

        res.status(201).json({ duration, user, mainText });
    } catch (error) {
        console.error("Error starting test:", error);
        res.status(500).json({ error: "An error occurred while starting the test" });
    }
};


export const submitTest = async (req, res) => {
    try {
        const { wpm, accuracy, duration } = req.body;
        const userId = req.body.user?.userId; 


        if (!userId) {
            return res.status(403).json({ error: "Authentication failed" });
        }

        const date = new Date();
        const newTypingHistory = { wpm, accuracy, duration, date };

        const userObj = await User.findById(userId); 

        if (!userObj) {
            return res.status(404).json({ error: "User not found" });
        }

        // Initialize typinghistory if not present
        if (!userObj.typinghistory) {
            userObj.typinghistory = [];
        }

        const curr_maxspeed = userObj.maxspeed || 0;
        if (curr_maxspeed < wpm) {
            userObj.maxspeed = wpm;
        }
        const last_Avg_speed = userObj.avg_speed || 0;
        const historyLength = userObj.typinghistory.length;
        const totalSpeed = last_Avg_speed * historyLength + wpm;
        const new_Avg_speed = totalSpeed / (historyLength + 1);

        userObj.avg_speed = Math.floor(new_Avg_speed);
        userObj.typinghistory.push(newTypingHistory);

        // Save the updated user object
        await userObj.save();

        res.status(201).json({
            message: "Typing test submitted successfully",
            wpm,
            accuracy,
            duration,
            date
        });
    } catch (error) {
        console.error("Error submitting test:", error);
        res.status(500).json({ error: "An error occurred while submitting the test" });
    }
};



export const leaderBoard = async (req, res) => {
    try {
         const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        console.log("Fetching leaderboard from database...");
        const leaderboard = await User.find()
        .select('username avatar maxspeed -_id')
        .sort({ maxspeed: -1 })
        .skip(skip)
        .limit(limit);
         if (!leaderboard.length) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No users found on the leaderboard",
            });
        }
         res.status(200).json({
            success: true,
            data: leaderboard,
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                nextPage: leaderboard.length === limit ? page + 1 : null,
            },
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).send("Can't access the leaderboard");
    }
};

