const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const {
  getDashboard,
  getOpportunities,
  createOpportunity,
  getTasks,
  updateTask,
  getInterviews,
  createInterview,
  updateInterview,
  getResults,
  createResult,
  getProfile,
  saveProfile,
  uploadProfileImage,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/coordinatorController");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/dashboard", auth, getDashboard);
router.get("/opportunities", auth, getOpportunities);
router.post("/opportunities", auth, createOpportunity);

router.get("/tasks", auth, getTasks);
router.patch("/tasks/:id", auth, updateTask);

router.get("/interviews", auth, getInterviews);
router.post("/interviews", auth, createInterview);
router.patch("/interviews/:id", auth, updateInterview);

router.get("/results", auth, getResults);
router.post("/results", auth, createResult);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, saveProfile);
router.post("/profile/upload-image", auth, upload.single("image"), uploadProfileImage);

router.get("/notifications", auth, getNotifications);
router.patch("/notifications/:id/read", auth, markNotificationAsRead);
router.patch("/notifications/read-all", auth, markAllNotificationsAsRead);

module.exports = router;