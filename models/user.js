import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { 
        type: String, 
        required: true 
    },
    maxspeed: { 
        type: Number, 
        default: 0 
    },
    avg_speed: { 
        type: Number, 
        default: 0 
    },
    typinghistory: [{
        wpm: Number,
        accuracy: Number,
        duration: Number,
        date: { 
            type: Date, 
            default: Date.now 
        },
    }],
});

// Compile and export the model
const User = mongoose.model("User", userSchema);
export default User;
