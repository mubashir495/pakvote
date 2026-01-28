import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    father_name: {
      type: String,
      required: true,
      trim: true,
    },

 cnic_no: {
  type: String,      
  required: true,
  unique: true,
  trim: true,
  validate: {
    validator: function (value) {
      return /^[0-9]{13}$/.test(value);
    },
    message: "CNIC must be exactly 13 digits",
  },
},

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    date_of_birth: {
      type: Date,
      required: true,
      max: Date.now,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "candidate", "user","party"],
      default: "user",
    },

    constituency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Constituency",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
