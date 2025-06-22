import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Function to send OTP email
async function sendOTPEmail(email, otpCode) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
          service: "gmail",
          // host: 'smtp-relay.brevo.com',
          // port:587,

          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD, // my email password or app-specific password
          },
        });

        // HTML email template stored in variable
        const otpMail = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NestHub OTP Verification</title>
            <style>
                body, html { margin: 0; padding: 0; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden; }
                .header { padding: 25px 20px; background-color: #2c3e50; color: white; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                .content { padding: 30px; }
                .content h2 { margin-top: 0; color: #2c3e50; font-size: 20px; }
                .otp-box { background-color: #f8f9fa; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0; border: 1px dashed #ddd; }
                .otp-code { font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #2c3e50; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; }
                @media only screen and (max-width: 600px) {
                    .container { padding: 10px; }
                    .content { padding: 20px; }
                    .otp-code { font-size: 24px; letter-spacing: 3px; }
                    .header h1 { font-size: 20px; }
                    .content h2 { font-size: 18px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h1>NestHub</h1>
                    </div>
                    <div class="content">
                        <h2>OTP Verification Code</h2>
                        <p>Hello,</p>
                        <p>Your One-Time Password (OTP) for verification is:</p>
                        <div class="otp-box">
                            <div class="otp-code">${otpCode}</div>
                        </div>
                        <p>This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
                        <p>If you didn't request this code, you can safely ignore this email.</p>
                        <p>Thank you,<br>The NestHub Team</p>
                    </div>
                    <div class="footer">
                        © ${new Date().getFullYear()} NestHub. All rights reserved.<br>
                        Need help? Contact us at support@nesthub.com
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Email options
        const mailOptions = {
            from: '"NestHub" <no-reply@nesthub.com>',
            to: email,
            subject: 'Your NestHub OTP Verification Code',
            html: otpMail
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export default sendOTPEmail;

// Example usage
// sendOTPEmail('user@example.com', '654321');