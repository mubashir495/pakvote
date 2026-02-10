import mongoose from "mongoose";

const CandidateApplicantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    party_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party", 
      required: false,
    },
    applied_seats: {
      type: String,
      enum: ["MPA", "MNA"],
      required: true,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("CandidateApplicant", CandidateApplicantSchema);
