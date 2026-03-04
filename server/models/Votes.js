import mongoose from "mongoose";

const VotesSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  candidateID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  constituencyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Constituency",
    required: true,
  },
  position: {
    type: String,
    enum: ["MPA", "MNA"],
    required: true,
  },

}, { timestamps: true });

VotesSchema.index({ userID: 1, position: 1 }, { unique: true });

export default mongoose.model("Vote", VotesSchema);