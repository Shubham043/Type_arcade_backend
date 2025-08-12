import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// import User from '../models/user';
const password = process.env.APP_PASSWORD
const app_mail = process.env.APP_MAIL
const sendEmail = async (recipientEmail, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: app_mail,
                pass: password 
            }
        });

        const mailOptions = {
            from: app_mail, 
            to: recipientEmail,
            subject: subject,
            text: message, 
            html: `<p>${message}</p>` 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;

// sendEmail('recipient-email@example.com', 'Welcome to TypeArcade', 'Thanks for signing up!');