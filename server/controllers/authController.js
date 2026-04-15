const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CoordinatorProfile = require("../models/CoordinatorProfile");

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const ensureJwtSecret = (res) => {
  if (!process.env.JWT_SECRET) {
    res
      .status(500)
      .json({ message: "Server auth is not configured. Add JWT_SECRET in server/.env and restart server." });
    return false;
  }
  return true;
};

exports.register = async (req, res) => {
  try {
    if (!ensureJwtSecret(res)) {
      return;
    }

    const { name, email, password, designation, phone, department } = req.body;

    if (!name || !email || !password || !designation || !phone || !department) {
      return res
        .status(400)
        .json({ message: "Name, email, password, designation, phone, and department are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await CoordinatorProfile.create({
      user: user._id,
      fullName: name.trim(),
      designation: designation.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      department: department.trim(),
      profileImageUrl: "",
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    if (!ensureJwtSecret(res)) {
      return;
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!ensureJwtSecret(res)) {
      return;
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};
