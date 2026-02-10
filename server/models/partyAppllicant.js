import mongoose from "mongoose";

const PartyApplicantSchema = new mongoose.Schema(
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

    notes: {
      type: String,
      required: true,
    },

    party_members: [
      {
        name: { type: String, required: true },
        cnic: { type: String, required: true },
        details: { type: String },
      },
    ],

    party_office_bearers: [
      {
        name: { type: String, required: true },
        designation: { type: String, required: true },
        cnic: { type: String, required: true },
        contact: { type: String },
      },
    ],
//payment method
    payment: {
      method: { type: String, required: true },
      amount: { type: Number, required: true },
      transaction_id: { type: String },
      proof_image: { type: String, required: true },
    },


    party_constitution_document: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    rejection_reason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PartyApplicant", PartyApplicantSchema);
