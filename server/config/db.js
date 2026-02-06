import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const DATABASE_URL = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
export  async function mongooseConection() {
  await mongoose.connect(DATABASE_URL+DB_NAME)
  .catch(err => console.log(err))
  .then(()=>console.log("conection successfully"));
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("symbols");
    const indexes = await collection.indexes();
    
    for (const idx of indexes) {
      if (idx.name !== "_id_") {
        await collection.dropIndex(idx.name);
      }
    }
  
    await collection.createIndex({ name: 1 }, { unique: true });
    
  } catch (error) {
  
  }
}