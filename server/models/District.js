import mongoose from "mongoose";

const DistrictSchema = new mongoose.Schema({
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
 division_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Division",
  required: true
}
}, {
  timestamps: true
});

export default mongoose.model("District", DistrictSchema);
