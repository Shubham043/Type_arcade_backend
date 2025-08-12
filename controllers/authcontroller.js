import userSchema from "../models/user.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import sendEmail from "../utils/emailverification.js";
dotenv.config();

const url = process.env.PROD;
//verifymail controller
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await userSchema.findOne({ verificationToken: token });

        if (!user) {
            return res
                .status(400)
                .send("Invalid or expired verification link.");
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send("✅ Email verified! You can now log in.");
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).send("Error verifying email");
    }
};

// Sign up controller
export const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (!validator.isLength(password, { min: 8 })) {
            return res
                .status(400)
                .json({ error: "Password must be at least 8 characters" });
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({
                error: "Password must contain uppercase, lowercase, number, and symbol",
            });
        }
        if (!username || username.length < 3) {
            return res
                .status(400)
                .json({ error: "Username must be at least 3 characters" });
        }
        if (username == password) {
            return res
                .status(400)
                .json({ message: "username and password must be different" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");
        const newUser = new userSchema({
            username,
            email,
            password: hashedPassword,
            verificationToken: token,
        });

        await newUser.save();
        console.log(newUser);
        const verificationLink = `https://typearcade-backend.onrender.com/auth/verify/${token}`;
        await sendEmail(
            email,
            "Verify your TypeArcade account 🎯",
            `Hi ${username}, click here to verify: ${verificationLink}`
        );
        res.status(201).json({
            message: "Sign Up Successful",
            user: newUser,
        });
    } catch (error) {
        console.error("Sign-up error:", error);
        res.status(500).send("Error signing up");
    }
};

// Sign in controller
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!user.verified) {
            return res
                .status(403)
                .json({ error: "Please verify your email before logging in." });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "Sign-in successful", token, user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
};

// Get User Profile controller (Redis removed)
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.user?.userId;
        if (!userId) {
            return res.status(403).send({ message: "Authentication failed" });
        }

        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const userProfile = {
            username: user.username,
            email: user.email,
            maxspeed: user.maxspeed,
            avg_speed: user.avg_speed,
            typinghistory: user.typinghistory,
        };

        res.status(200).send(userProfile);
    } catch (error) {
        res.status(500).send(
            "An error occurred while fetching the user profile"
        );
    }
};

export const createPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!validator.isLength(password, { min: 8 })) {
            return res
                .status(400)
                .json({ error: "Password must be at least 8 characters" });
        }
    if (!validator.isStrongPassword(password)) {
            return res.status(400).json({
                error: "Password must contain uppercase, lowercase, number, and symbol",
            });
    }
    const user = await userSchema.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }
   
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.verificationToken = undefined; 
    await user.save();

    res.status(200).json({ message: "✅ Password updated! You can now log in." });
  } catch (error) {
    console.error("Create Password Error:", error);
    res.status(500).json({ message: "Error setting new password" });
  }
};


export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body; 
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    await user.save();

    const verificationLink = `${url}/auth/createPassword/${token}`;

    await sendEmail(
      email,
      "Set Your New Password 🎯",
      `Hi ${user.username}, click here to reset: ${verificationLink}`
    );

    res.status(200).json({ message: "Reset email sent!" });
  } catch (error) {
    console.error("Forget Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
