import userSchema from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redisClient from "../utils/redis.js";

dotenv.config();

// sign up controller
export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userSchema({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
     console.log(newUser);
     
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
export  const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found with this email");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).send("Wrong password");
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Send the token in the response
    res.status(200).json({ message: "Sign-in successful", token,user});

  } catch (error) {
    console.log(error);
    
    res.status(500).send("Server error");
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.user?.userId;
    if (!userId) {
      return res.status(403).send("Authentication failed");
    }
    const cachedProfileStatic = await  redisClient.get(`userProfileStatic:${userId}`);
    let userStatic;
    if(cachedProfileStatic){
      console.log("fetching data from redis ...")
      userStatic = JSON.parse(cachedProfileStatic);
    }
    else{
      console.log("fetching static data from database ...");
      const user = await userSchema.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      userStatic = {username : user.username,email : user.email};
      await redisClient.set(`userProfileStatic:${userId}`,JSON.stringify(userStatic),'EX',3600);
      
    }
    
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
     const userProfile = {
      ...userStatic,
      maxspeed : user.maxspeed,
      avg_speed : user.avg_speed,
      typinghistory : user.typinghistory
     }

    res.status(200).send(userProfile);
    // console.log(user); 
  } catch (error) {
    res.status(500).send("An error occurred while fetching the user profile");
    // console.log(error);
  }
};
 