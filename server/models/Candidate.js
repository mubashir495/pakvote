import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique:true
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
    symbol_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Symbol", 
      unique:true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", CandidateSchema);
