const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    interviewDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Scheduled", "Open", "Closed"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);
