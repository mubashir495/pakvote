import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { mongooseConection } from "./config/db.js";
import ProvinceRoutes from "./routes/proviceRoutes.js"
import DistrictRoutes from "./routes/districtRoutes.js"
import DivisionRoutes from "./routes/divisionRoutes.js"
import TehsilRoutes from "./routes/tehsilRoutes.js"
import ConstituencyRoutes from "./routes/constituencyRoutes.js";
import AuthRouter from "./routes/authRoutes.js";
import HierarchyRoutes from "./routes/hierarchyRoutes.js";
import { corsOptions } from "./middlewares/corsmiddlewares.js";
import cookieParser from "cookie-parser";
import candidateApplicantRoutes from "./routes/candidateApplicantRoutes.js"
import symbolRoutes from "./routes/symbolRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
dotenv.config()
const PORT = process.env.PORT || 5050;
mongooseConection();


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/division",DivisionRoutes);
app.use("/api/province",ProvinceRoutes);
app.use("/api/district",DistrictRoutes);
app.use("/api/tehsil",TehsilRoutes)
app.use("/api/constituency",ConstituencyRoutes);
app.use("/api/auth",AuthRouter)
app.use("/api/hierarchy/",HierarchyRoutes)
app.use("/api/symbol",symbolRoutes)
// aplicant routes 
app.use("/api/candidateApplicant",candidateApplicantRoutes)
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
