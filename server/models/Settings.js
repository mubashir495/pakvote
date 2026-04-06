import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  candidate_startTime: {
    type: Date,
    default: null,
  },
  candidate_endTime: {
    type: Date,
    default: null,
  },
  party_startTime: {
    type: Date,
    default: null,
  },
  party_endTime: {
    type: Date,
    default: null,
  },
  voting_startTime: {
    type: Date,
    default: null,
  },
  voting_endTime: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
