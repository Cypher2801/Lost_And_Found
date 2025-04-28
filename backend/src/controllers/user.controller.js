import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ApiError} from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, roll_number, phone, hostel, room_number } = req.body;
    if (!name || !email || !password || !roll_number || !phone || !hostel || !room_number) {
      throw new ApiError(400, "All required fields must be filled");
    }

    const [existingUsers] = await db.query(
      "SELECT * FROM Users WHERE email = ? OR rollNumber = ?",
      [email, roll_number]
    );

    if (existingUsers.length > 0) {
      throw new ApiError(409, "User already exists with that email or roll number");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePicUrl = null;

    if (req.files && Array.isArray(req.files.profilePic) && req.files.profilePic.length > 0) {
      const localPath = req.files.profilePic[0].path;
      try {
        const cloudinaryResult = await uploadOnCloudinary(localPath);
        profilePicUrl = cloudinaryResult.url;
      } catch {
        throw new ApiError(500, "Error uploading profile picture to cloud storage");
      }
    }

    const [insertResult] = await db.query(
      `INSERT INTO Users (name, email, passwordHash, rollNumber, phoneNumber, profilePic, hostel, roomNumber)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, roll_number, phone, profilePicUrl, hostel, room_number]
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `INSERT INTO OTP_Verification (email, OTPCode, ExpiresAt) VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    await sendEmail({
      to: email,
      subject: "Verify your email - Lost & Found",
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    });

    res.status(201).json({ message: "User registered. Please verify your email." });
  } catch (error) {
    throw new ApiError(error.status || 500, error.message || "Internal server error");
  }
});

// Login User
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

  if (users.length === 0 || !(await bcrypt.compare(password, users[0].passwordHash))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign({ userId: users[0].UserID }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: users[0].UserID,
      name: users[0].name,
      email: users[0].email,
      rollNumber: users[0].rollNumber,
      hostel: users[0].hostel,
      roomNumber: users[0].roomNumber
    }
  });
});

// Logout User
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const [users] = await db.query("SELECT * FROM Users WHERE UserID = ?", [userId]);

  if (users.length === 0) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    user: {
      id: users[0].UserID,
      name: users[0].name,
      email: users[0].email,
      phone: users[0].phoneNumber,
      rollNumber: users[0].rollNumber,
      hostel: users[0].hostel,
      roomNumber: users[0].roomNumber,
      profilePic: users[0].profilePic
    }
  });
});

// Verify Email with OTP
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const [records] = await db.query(
    `SELECT * FROM OTP_Verification WHERE email = ? ORDER BY ExpiresAt DESC LIMIT 1`,
    [email]
  );

  if (records.length === 0 || records[0].OTPCode !== otp || new Date(records[0].ExpiresAt) < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await db.query("UPDATE Users SET EmailVerified = TRUE WHERE email = ?", [email]);

  res.status(200).json({ message: "Email verified successfully" });
});

// Forgot Password (send OTP)
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

  if (users.length === 0) {
    throw new ApiError(404, "User not found with this email");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.query(
    `INSERT INTO OTP_Verification (email, OTPCode, ExpiresAt) VALUES (?, ?, ?)`,
    [email, otp, expiresAt]
  );

  await sendEmail({
    to: email,
    subject: "Password Reset OTP - Lost & Found",
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`
  });

  res.status(200).json({ message: "OTP sent to email for password reset" });
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const [records] = await db.query(
    `SELECT * FROM OTP_Verification WHERE email = ? ORDER BY ExpiresAt DESC LIMIT 1`,
    [email]
  );

  if (records.length === 0 || records[0].OTPCode !== otp || new Date(records[0].ExpiresAt) < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE Users SET passwordHash = ? WHERE email = ?", [hashedPassword, email]);

  res.status(200).json({ message: "Password reset successful" });
});

// Update Profile Picture
export const updateProfilePic = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  if (!req.files || !Array.isArray(req.files.profilePic) || req.files.profilePic.length === 0) {
    throw new ApiError(400, "Profile picture file is required");
  }

  const localPath = req.files.profilePic[0].path;

  try {
    const uploadResult = await uploadOnCloudinary(localPath);
    await db.query("UPDATE Users SET profilePic = ? WHERE UserID = ?", [uploadResult.url, userId]);
    res.status(200).json({ message: "Profile picture updated", profilePic: uploadResult.url });
  } catch (error) {
    throw new ApiError(500, "Error uploading image to cloud storage");
  }
});

// Update Phone Number
export const updatePhoneNumber = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new ApiError(400, "Phone number is required");
  }

  await db.query("UPDATE Users SET phoneNumber = ? WHERE UserID = ?", [phoneNumber, userId]);
  res.status(200).json({ message: "Phone number updated" });
});

// Update Hostel and Room Number
export const updateHostelAndRoom = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { hostel, roomNumber } = req.body;

  if (!hostel || !roomNumber) {
    throw new ApiError(400, "Hostel and room number are required");
  }

  await db.query("UPDATE Users SET hostel = ?, roomNumber = ? WHERE UserID = ?", [hostel, roomNumber, userId]);
  res.status(200).json({ message: "Hostel and room number updated" });
});
