import CandidateApplicant from "../models/CandidateApplicant.js";
import User from "../models/User.js";
import fs from "fs";
import { sendEmail } from "../utils/mailer.js";
import mongoose from "mongoose";

export const addCandidateApplicant = async (req, res) => {
  try {
    const { notes, party,isApplyForSeat } = req.body;
    const userId = req.user.id;

    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: "Notes field must be filled" });
    }

    const degreeDocuments = req.files ? req.files.map(file => file.path) : [];
    if (degreeDocuments.length === 0) {
      return res.status(400).json({ success: false, message: "At least one document (degree file) must be uploaded" });
    }
    const degreeNames = [];
    Object.keys(req.body).forEach(key => {
      const match = key.match(/degrees\[(\d+)\]\[name\]/);
      if (match) {
        const degName = req.body[key];
        if (degName && degName.trim()) {
          degreeNames.push(degName.trim());
        }
      }
    });

    const appliedSeat = isApplyForSeat 
    if (!appliedSeat || !["MPA", "MNA"].includes(appliedSeat)) {
      return res.status(400).json({ success: false, message: "Applied seat must be either 'MPA' or 'MNA'" });
    }

    const newCandidate = await CandidateApplicant.create({
      userId,
      Degree_names: degreeNames.length > 0 ? degreeNames : ["Unspecified"],
      Degree_Documents: degreeDocuments,
      party_id: party || null,
      applied_seats: appliedSeat,
      notes: notes.trim(),
      status: false,
    });

    const user = await User.findById(userId);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: "Candidate Documents Submitted Successfully",
        text: `Hello ${user.name},\n\nYour candidate application with ${degreeDocuments.length} document(s) for ${appliedSeat} has been submitted successfully.\n\nThank you!`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Candidate added, documents saved, and email sent successfully",
      data: newCandidate,
    });
  } catch (error) {
    console.error("❌ Add candidate error:", error.message);
    
    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ 
      success: false,
      message: error.message || "Server Error" 
    });
  }
};

export const deleteCandidateApplicant = async (req, res) => {
  try {
    const candidate = await CandidateApplicant.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    if (candidate.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (candidate.Degree_Documents && candidate.Degree_Documents.length > 0) {
      candidate.Degree_Documents.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await candidate.deleteOne();

    res.status(200).json({ success: true, message: "Candidate and documents deleted successfully" });
  } catch (error) {
    console.error("❌ Delete candidate error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const getAllCandidatesApplicant = async (req, res) => {
  try {
    const candidates = await CandidateApplicant.find()
      .populate("userId", "name email age constituency")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    console.error("❌ Get all candidates error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const getCandidatesApplicantByParty = async (req, res) => {
  try {
    const { partyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      return res.status(400).json({ success: false, message: "Invalid party ID" });
    }

    const candidates = await CandidateApplicant.find({ party_id: partyId })
      .populate("userId", "name email age constituency")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    console.error("❌ Get candidates by party error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const getMyCandidateApplicantDetails = async (req, res) => {
  try {
    const candidate = await CandidateApplicant.findOne({ userId: req.user.id })
      .populate("userId", "name email age constituency");

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found for this user" });
    }

    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    console.error("❌ Get my candidate details error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
