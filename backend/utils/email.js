import nodemailer from 'nodemailer';

const sendOTPEmail = async (email, otp) => {
  try {
    console.log('Email: ', process.env.EMAIL_USER);
    console.log('Pass : ', process.env.EMAIL_PASS);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Funky Stitch" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Your Verification Code</h2>
          <p style="font-size: 16px;">Please use the following code to verify your email:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #7f8c8d;">This code will expire in 15 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

export default sendOTPEmail;
