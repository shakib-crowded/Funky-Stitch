import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import TempUser from '../models/tempUserModel.js';
import sendOTPEmail from '../utils/email.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
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
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate new OTP and expiry
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Check if TempUser exists
  let tempUser = await TempUser.findOne({ email });

  if (tempUser) {
    // Update existing temp user with new OTP and password (optional: overwrite name too)
    tempUser.otp = otp;
    tempUser.otpExpiry = otpExpiry;
    tempUser.password = password;
    tempUser.name = name;
    await tempUser.save();
  } else {
    // Create new temp user
    tempUser = await TempUser.create({
      name,
      email,
      password,
      otp,
      otpExpiry,
    });
  }

  // Send OTP
  sendOTPEmail(email, otp);

  res.status(200).json({
    message: 'OTP sent to email',
    email,
    tempUserId: tempUser._id,
  });
});

// @desc    Verify OTP and complete registration
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { tempUserId, otp, email } = req.body;

  const tempUser = await TempUser.findOne({
    _id: tempUserId,
    email,
    otpExpiry: { $gt: Date.now() },
  });

  if (!tempUser || tempUser.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP or OTP expired');
  }

  // Create the actual user
  const user = await User.create({
    name: tempUser.name,
    email: tempUser.email,
    password: tempUser.password,
  });

  if (user) {
    generateToken(res, user._id);

    // Clean up - delete temp user
    await TempUser.deleteOne({ _id: tempUserId });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
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
import nodemailer from 'nodemailer';

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
};
