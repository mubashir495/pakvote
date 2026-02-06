import mongoose from "mongoose";

const SymbolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image:{
    type:String,
    required :true,
    trim: true,
}
}, {
  timestamps: true
});

export default mongoose.model("Symbol", SymbolSchema);
