import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    complaint_type: {
      type: String,
      enum: ["voting issue", "misconduct", "technical", "fraud", "other"],
      default: "other",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
