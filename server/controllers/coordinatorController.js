const Task = require("../models/Task");
const Interview = require("../models/Interview");
const Opportunity = require("../models/Opportunity");
const Result = require("../models/Result");
const CoordinatorProfile = require("../models/CoordinatorProfile");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");

const createNotification = async ({ user, title, message, type }) => {
  await Notification.create({ user, title, message, type });
};

const taskAccessFilter = (userId) => ({
  $or: [{ assigneeUser: userId }, { user: userId }],
});

exports.getDashboard = async (req, res) => {
  try {
    const assignedCompanies = await Opportunity.countDocuments({ user: req.user.id });
    const pendingTasks = await Task.countDocuments({
      ...taskAccessFilter(req.user.id),
      status: { $ne: "Completed" },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const interviewsToday = await Interview.countDocuments({
      user: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd },
    });
    const completedTasks = await Task.countDocuments({
      ...taskAccessFilter(req.user.id),
      status: "Completed",
    });

    res.json({
      assignedCompanies,
      pendingTasks,
      interviewsToday,
      completedTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
  }
};

exports.getOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ user: req.user.id }).sort({ interviewDate: 1 });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch opportunities", error: error.message });
  }
};

exports.createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create({ ...req.body, user: req.user.id });
    await createNotification({
      user: req.user.id,
      title: "New Opportunity Added",
      message: `${opportunity.companyName} - ${opportunity.role}`,
      type: "opportunity",
    });
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: "Failed to create opportunity", error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find(taskAccessFilter(req.user.id)).sort({ deadline: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id,
      assigneeUser: req.user.id,
      assignedBy: req.user.id,
      source: "self",
    });
    await createNotification({
      user: req.user.id,
      title: "New Task Created",
      message: `${task.title} for ${task.company}`,
      type: "task",
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, ...taskAccessFilter(req.user.id) },
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id }).sort({ date: 1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interviews", error: error.message });
  }
};

exports.createInterview = async (req, res) => {
  try {
    const interview = await Interview.create({ ...req.body, user: req.user.id });
    await createNotification({
      user: req.user.id,
      title: "Interview Scheduled",
      message: `${interview.company} - ${interview.roundType} round`,
      type: "interview",
    });
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to create interview", error: error.message });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to update interview", error: error.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const savedResult = await Result.create({ ...req.body, user: req.user.id });
    await createNotification({
      user: req.user.id,
      title: "Result Updated",
      message: `${savedResult.studentName} - ${savedResult.result}`,
      type: "result",
    });
    res.status(201).json(savedResult);
  } catch (error) {
    res.status(500).json({ message: "Failed to save result", error: error.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await CoordinatorProfile.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

exports.saveProfile = async (req, res) => {
  try {
    const existingProfile = await CoordinatorProfile.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!existingProfile) {
      const createdProfile = await CoordinatorProfile.create({ ...req.body, user: req.user.id });
      return res.status(201).json(createdProfile);
    }

    existingProfile.fullName = req.body.fullName;
    existingProfile.designation = req.body.designation;
    existingProfile.email = req.body.email;
    existingProfile.phone = req.body.phone;
    existingProfile.department = req.body.department;
    if (typeof req.body.profileImageUrl === "string") {
      existingProfile.profileImageUrl = req.body.profileImageUrl;
    }
    await existingProfile.save();

    res.json(existingProfile);
  } catch (error) {
    res.status(500).json({ message: "Failed to save profile", error: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res
        .status(500)
        .json({ message: "Cloudinary is not configured. Set CLOUDINARY_* in server/.env and restart backend." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "placement-management/profile-images" },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: uploaded.secure_url, publicId: uploaded.public_id });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications", error: error.message });
  }
};
