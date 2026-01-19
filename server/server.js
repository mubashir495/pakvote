import express from "express";
import dotenv from "dotenv";
import { mongooseConection } from "./config/db.js";
const app = express()

dotenv.config()
const PORT = process.env.PORT || 5050;

mongooseConection()
app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
