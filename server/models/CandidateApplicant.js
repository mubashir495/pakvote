import mongoose from "mongoose";

const CandidateApplicantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Degree_names: {
      type: [String],
      required: true,
    },
    Degree_Documents: {
      type: [String], 
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
    notes: {
      type: String, 
      required: true,
    },
    status:{
      type: Boolean,
        required:true,
        default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("CandidateApplicant", CandidateApplicantSchema);
