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

    // Voting Area (NA or PP depending on seat)
    voting_area: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "voting_area_model",
    },

    voting_area_model: {
      type: String,
      required: true,
      enum: ["ConstituencyNA", "ConstituencyPP"],
    },

    notes: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("CandidateApplicant", CandidateApplicantSchema);