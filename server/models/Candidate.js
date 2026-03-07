import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    party_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
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
    symbol_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Symbol",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", CandidateSchema);