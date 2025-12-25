import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    savedJobs: [{ title: String, link: String }],
    // OTP object for short-lived login codes (not used for persistent passwords)
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    // meta info such as last login
    meta: {
      lastLogin: { type: Date },
    },
    // simple role field
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
