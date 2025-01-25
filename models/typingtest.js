import mongoose, { Schema } from "mongoose";

const typingTestSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TypingTest = mongoose.model("TypingTest", typingTestSchema);
export default TypingTest;
