import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true, // Made required
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      // Changed from emailOtp to just otp
      type: String,
      required: true,
    },
    otpExpiry: {
      // Changed from emailOtpExpiry
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TempUser = mongoose.model('TempUser', tempUserSchema);

export default TempUser;
