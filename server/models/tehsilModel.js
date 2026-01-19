import mongoose from "mongoose";

const TehsilSchema = new mongoose.Schema({
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
 province_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "District",
  required: true
}
}, {
  timestamps: true
});

export default mongoose.model("Tehsil", TehsilSchema);
