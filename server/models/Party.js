import mongoose from "mongoose";

const PartySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    party_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    party_admin_name: {
      type: String,
      required: true,
      trim: true,
    },
     party_Symbol:{
     type: mongoose.Schema.Types.ObjectId,
     ref: "Symbol",
},
    notes: {
      type: String,
      required: true,
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Party", PartySchema);
