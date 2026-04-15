const mongoose = require("mongoose");

const coordinatorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    profileImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoordinatorProfile", coordinatorProfileSchema);
