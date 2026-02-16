import Symbol from "../models/Symbol.js";
import fs from "fs";
import Party from "../models/Party.js";
import Candidate from "../models/Candidate.js";

/* ================= CREATE SYMBOL ================= */
export const createSymbol = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Symbol name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Symbol image is required" });
    }

    const symbol = await Symbol.create({
      name: name.trim(),
      image: req.file.path,
    });

    res.status(201).json({ success: true, message: "Symbol created successfully", data: symbol });
  } catch (error) {
    console.error(error);

    // Duplicate name or image
    if (error.code === 11000) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(409).json({ success: false, message: "Symbol name or image already exists" });
    }

    res.status(500).json({ success: false, message: error.message || "Something went wrong" });
  }
};

/* ================= GET ALL SYMBOLS ================= */
/* ================= GET ALL SYMBOLS ================= */
export const getAllSymbols = async (req, res) => {
  try {
    let query = {};

    // If 'available=true' is passed, filter out assigned symbols
    if (req.query.available === 'true') {
      const assignedParties = await Party.find({}, 'party_Symbol');
      const assignedCandidates = await Candidate.find({}, 'symbol_id');
      
      const distinctPartySymbols = assignedParties
        .map(p => p.party_Symbol?.toString())
        .filter(Boolean);
        
      const distinctCandidateSymbols = assignedCandidates
        .map(c => c.symbol_id?.toString())
        .filter(Boolean);

      const assignedSymbolIds = [...new Set([...distinctPartySymbols, ...distinctCandidateSymbols])];
      
      query._id = { $nin: assignedSymbolIds };
    }

    const symbols = await Symbol.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: symbols.length, data: symbols });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET SYMBOL BY ID ================= */
export const getSymbolById = async (req, res) => {
  try {
    const symbol = await Symbol.findById(req.params.id);
    if (!symbol) return res.status(404).json({ success: false, message: "Symbol not found" });
    res.status(200).json({ success: true, data: symbol });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE SYMBOL ================= */
export const updateSymbol = async (req, res) => {
  try {
    const symbol = await Symbol.findById(req.params.id);
    if (!symbol) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "Symbol not found" });
    }

    if (req.body.name?.trim()) symbol.name = req.body.name.trim();

    if (req.file) {
      // Delete old image
      if (symbol.image && fs.existsSync(symbol.image)) fs.unlinkSync(symbol.image);
      symbol.image = req.file.path;
    }

    await symbol.save();
    res.status(200).json({ success: true, message: "Symbol updated successfully", data: symbol });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) return res.status(409).json({ success: false, message: "Symbol name or image already exists" });

    res.status(500).json({ success: false, message: error.message || "Update failed" });
  }
};

/* ================= DELETE SYMBOL ================= */
export const deleteSymbol = async (req, res) => {
  try {
    const symbol = await Symbol.findById(req.params.id);
    if (!symbol) return res.status(404).json({ success: false, message: "Symbol not found" });

    // Delete image from server
    if (symbol.image && fs.existsSync(symbol.image)) fs.unlinkSync(symbol.image);

    await symbol.deleteOne();
    res.status(200).json({ success: true, message: "Symbol deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Delete failed" });
  }
};
