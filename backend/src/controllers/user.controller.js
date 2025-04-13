import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import db from "../db/index.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

export const createAdmin = asyncHandler(async (req, res) => {

  const { name, email, password, roll_number, phone } = req.body;

  if (!name || !email || !password || !roll_number) {
    throw new ApiError(400, "Name, email, password and roll number are required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users (name, roll_number, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'admin')`,
    [name, roll_number, email, hashedPassword, phone || null]
  );

  res.status(201).json({ message: "Admin account created successfully" });
});

export const registerUser = asyncHandler(async (req, res) => {
    try {
      const { name, email, password, roll_number, phone } = req.body;
      if (!name || !email || !password || !roll_number) {
        throw new ApiError(400, "All required fields must be filled");
      }
  
      const [existingUsers] = await db.query(
        "SELECT * FROM users WHERE email = ? OR roll_number = ?",
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
        `INSERT INTO users (name, email, password, roll_number, phone, profile_pic_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, roll_number, phone, profilePicUrl]
      );
  
      const userId = insertResult.insertId;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      await db.query(
        `INSERT INTO email_verification (user_id, otp, created_at) VALUES (?, ?, NOW())`,
        [userId, otp]
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
  
  export const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });
  
    const [userRows] = await db.query(`SELECT user_id FROM users WHERE email = ?`, [email]);
    if (userRows.length === 0) return res.status(404).json({ message: "User not found" });
  
    const userId = userRows[0].user_id;
  
    const [otpRows] = await db.query(
      `SELECT * FROM email_verification WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
  
    if (otpRows.length === 0 || otpRows[0].otp !== otp.toString()) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }
  
    await db.query(`UPDATE users SET email_verified = true WHERE user_id = ?`, [userId]);
  
    res.json({ message: "Email verified successfully" });
  });
  

  export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  
    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
  
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
  
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
  
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
  
    res.json({ message: "Login successful", token });
  });

export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  if (!userId) return res.status(401).json({ message: "Unauthorized request" });

  const [users] = await db.query(
    "SELECT user_id, name, email, roll_number, phone, profile_pic_url, email_verified, role FROM users WHERE user_id = ?",
    [userId]
  );

  if (users.length === 0) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ user: users[0] });
});


export const logoutUser = asyncHandler(async (req, res) => {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    const [users] = await db.query(`SELECT user_id FROM users WHERE email = ?`, [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
  
    const userId = users[0].user_id;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    await db.query(`INSERT INTO password_resets (user_id, otp) VALUES (?, ?)`, [userId, otp]);
  
    await sendEmail({
      to: email,
      subject: "Lost & Found: Reset Your Password",
      text: `Your OTP for password reset is: ${otp}`,
      html: `<p>Your OTP to reset password is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    });
  
    res.json({ message: "OTP sent to your email." });
  });
  
  export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    const [users] = await db.query(`SELECT user_id FROM users WHERE email = ?`, [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
  
    const userId = users[0].user_id;
  
    const [otps] = await db.query(
      `SELECT * FROM password_resets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
  
    if (otps.length === 0 || otps[0].otp !== otp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    await db.query(
      `UPDATE users SET password = ? WHERE user_id = ?`,
      [hashedPassword, userId]
    );
  
    res.json({ message: "Password has been reset successfully." });
  });
  