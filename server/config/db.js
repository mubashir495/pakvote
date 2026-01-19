import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const DATABASE_URL = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
export  async function mongooseConection() {
  await mongoose.connect(DATABASE_URL+DB_NAME)
  .catch(err => console.log(err))
  .then(()=>console.log("conection successfully"));

};

