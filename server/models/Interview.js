const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    roundType: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
