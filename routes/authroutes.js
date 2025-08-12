import {signIn,signUp,getUserProfile,verifyEmail,createPassword, forgetPassword} from "../controllers/authcontroller.js";
import express from "express";
import authmiddleware from "../middleware/authmiddleware.js";
const router = express.Router();

//user routes
router.post('/signUp',signUp);
router.post('/signIn',signIn);
router.post('/forgotPassword',forgetPassword);
router.post('/createPassword/:token', createPassword);
router.get('/getuserprofile',authmiddleware,getUserProfile);
router.get('/verify/:token', verifyEmail);

export default router;
