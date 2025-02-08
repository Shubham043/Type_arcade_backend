import nodemailer from 'nodemailer';

const sendEmail = async (recipientEmail, subject, message) => {
    try {
        // Create a transporter using Gmail service (for example)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password' // Or an App Password for Gmail if you have 2FA enabled
            }
        });

        // Set up the email content
        const mailOptions = {
            from: 'your-email@gmail.com', 
            to: recipientEmail,
            subject: subject,
            text: message, // plain text body
            html: `<p>${message}</p>` // HTML body (optional)
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Usage
sendEmail('recipient-email@example.com', 'Welcome to TypeArcade', 'Thanks for signing up!');