import asyncHandler from '../middleware/asyncHandler.js';
// import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import TempUser from '../models/tempUserModel.js';
import sendOTPEmail from '../utils/email.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id); // ← return value

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token, // ← include in JSON response
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user (send OTP)
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

  // Validate phone number format
  if (!/^\d{10}$/.test(phone)) {
    res.status(400);
    throw new Error('Please enter a valid 10-digit phone number');
  }

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email or phone already exists');
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    // Delete any existing temp user
    await TempUser.deleteOne({ $or: [{ email }, { phone }] });

    // Create new temp user
    const tempUser = await TempUser.create({
      name,
      email,
      phone,
      password,
      otp,
      otpExpiry,
    });

    // Send email OTP
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      tempUserId: tempUser._id,
      email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
});
// @desc    Verify OTP and complete registration
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { tempUserId, otp, email } = req.body;

  if (!tempUserId || !otp || !email) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  const tempUser = await TempUser.findOne({
    _id: tempUserId,
    email,
    otpExpiry: { $gt: new Date() }, // Check expiry
  });

  if (!tempUser) {
    res.status(400);
    throw new Error('OTP expired or invalid request');
  }

  if (tempUser.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  try {
    // Create permanent user
    const user = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone, // Now saving phone number
      password: tempUser.password,
      isVerified: true,
    });

    // Generate auth token
    const token = generateToken(res, user._id);

    // Clean up temp user
    await TempUser.deleteOne({ _id: tempUserId });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone, // Return phone in response
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500);
    throw new Error('User creation failed. Please try again.');
  }
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
// backend/controllers/userController.js
const forgotPassword = asyncHandler(async (req, res) => {
  const email =
    typeof req.body.email === 'string'
      ? req.body.email // Normal case
      : req.body.email?.email;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user doesn't exist (security best practice)
      return res.status(200).json({
        success: true,
        message:
          'If an account exists with this email, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Update user with reset token
    try {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;

      await user.save();
    } catch (dbError) {
      console.error('Database save error:', dbError);
      res.status(500);
      throw new Error('Failed to save reset token');
    }

    // Create reset URL (use your frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Funky Stitch" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for your account with email: <strong>${user.email}</strong>.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color:#FF5252; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);

      // Rollback the token if email fails
      try {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
      } catch (rollbackError) {
        console.error('Failed to rollback reset token:', rollbackError);
      }

      res.status(500);
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500);
    throw new Error('An error occurred during the password reset process');
  }
});
// @desc    Reset password
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find user by token and check expiry
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  // Update password and clear reset token
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Can not delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// controllers/contactController.js
const contactUs = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // 1. Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Email options
    const mailOptions = {
      from: email,
      to: process.env.COMPANY_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        You have a new contact form submission:
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // 4. Send email
    await transporter.sendMail(mailOptions);

    // 5. Optionally save to database here if needed

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending contact form:', error);
    res.status(500).json({
      message: 'Error sending message',
      error: error.message,
    });
  }
};

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  contactUs,
  verifyOTP,
  forgotPassword,
  resetPassword,
};
