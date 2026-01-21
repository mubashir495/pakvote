import mongoose from "mongoose";

const DivisionSchema = new mongoose.Schema({
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
  ref: "Province",
  required: true
}
}, {
  timestamps: true
});

export default mongoose.model("Division", DivisionSchema);
