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
import CandidateApplicantRoutes from "./routes/candidateApplicantRoutes.js"
import SymbolRoutes from "./routes/symbolRoutes.js";
import PartySymbol from "./routes/partyApplicantRoutes.js"
import path from "path";
import { fileURLToPath } from "url";
import CandidateRoutes from "./routes/candidateRoutes.js"
import PartyRoutes from "./routes/partyRoutes.js"
import ContactRoutes from "./routes/contactRoutes.js"
import ComplaintRoutes from "./routes/complaintRoutes.js"

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
app.use("/api/symbol",SymbolRoutes)
app.use("/api/partyApplicant",PartySymbol)
app.use("/api/candidate",CandidateRoutes)
app.use("/api/party",PartyRoutes)
app.use("/api/contect-us",ContactRoutes)
app.use("/api/candidateApplicant",CandidateApplicantRoutes)
app.use("/api/complaint", ComplaintRoutes);


app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
