import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
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
  symbol_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Symbol",
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
  voting_area_model: {
    type: String,
    required: true,
    enum: ["ConstituencyNA", "ConstituencyPP"],
  },
}, { timestamps: true });

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);