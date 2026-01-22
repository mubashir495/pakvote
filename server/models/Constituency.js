import mongoose from "mongoose";

const ConstituancySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
 tehsil_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Tehsil",
  required: true
}
}, {
  timestamps: true
});

export default mongoose.model("Constituency", ConstituancySchema);
