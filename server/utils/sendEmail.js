const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT, // E.g., 2525, 587, 465
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define the email options
    const mailOptions = {
        from: `MR.EduEdge Portal <myat305055@gmail.com>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
