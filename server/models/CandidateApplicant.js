import mongoose from "mongoose";

const CandidateApplicantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true 
    },

    degrees: [
      {
        name: { type: String, required: true },
        document: { type: String, required: true },
      },
    ],

    party_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
    },

    isIndependent: {
      type: Boolean,
      default: false,
    },

    applied_seats: {
      type: String,
      enum: ["MPA", "MNA"],
      required: true,
    },

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

    assets: {
      type: String,
      required: true,
    },

    hasCriminalRecord: {
      type: Boolean,
      default: false,
    },

    criminalDetails: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CandidateApplicant", CandidateApplicantSchema);