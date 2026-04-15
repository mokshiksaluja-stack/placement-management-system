const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    result: { type: String, required: true, trim: true },
    round: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
