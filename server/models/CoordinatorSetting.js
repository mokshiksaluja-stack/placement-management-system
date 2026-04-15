const mongoose = require("mongoose");

const coordinatorSettingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionName: { type: String, required: true, trim: true },
    notificationEmail: { type: String, required: true, trim: true },
    timezone: { type: String, required: true, trim: true },
    darkSidebar: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoordinatorSetting", coordinatorSettingSchema);
