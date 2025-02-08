import {signIn,signUp,getUserProfile} from "../controllers/authcontroller.js";
import express from "express";
import authmiddleware from "../middleware/authmiddleware.js";
const router = express.Router();

//user routes
router.post('/signUp',signUp);
router.post('/signIn',signIn);
router.get('/getuserprofile',authmiddleware,getUserProfile);

export default router;
