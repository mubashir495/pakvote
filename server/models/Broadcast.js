import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender_role: {
      type: String,
      enum: ["admin", "candidate", "party"],
      required: true,
    },

    receiver_type: {
      type: String,
      enum: ["single", "multiple", "broadcast"],
      required: true,
    },

    receiver_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isBroadcast: {
      type: Boolean,
      default: false,
    },
    party_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, 
  }
);

export const Message = mongoose.model("Message", messageSchema);