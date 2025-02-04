import axios from "axios";
import typingTestSchema from "../models/typingtest.js";
import mongoose from "mongoose";

import userSchema from "../models/user.js";

// Start test controller
export const startTest = async (req, res) => {
    try {
        const { duration = 15 } = req.body; 
        const user = req.body.user; 

        if (!user) {
            return res.status(403).json({ error: "Authentication failed" });
        }

        // Fetch mainText from an API
        let mainText = "All I dream of is your eyes, all I long for is your touch."; // Default text
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

// Submit test controller
import User from "../models/user.js"; // Make sure User is correctly imported

export const submitTest = async (req, res) => {
    try {
        const { wpm, accuracy, duration } = req.body;
        const userId = req.body.user?.userId;  // Access userId from req.body.user

        console.log(userId);  // Debugging to see if the userId is correctly extracted

        if (!userId) {
            return res.status(403).json({ error: "Authentication failed" });
        }

        const date = new Date();
        const newTypingHistory = { wpm, accuracy, duration, date };

        // Fetch the user from the database using the userId
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
        // Sort by 'maxspeed' in descending order
        const cachedleaderboard = await redis.get('leaderboard:global')
        const leaderboard = await userSchema.find().sort({ maxspeed: -1 });
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).send("Can't access the leaderboard");
    }
};

