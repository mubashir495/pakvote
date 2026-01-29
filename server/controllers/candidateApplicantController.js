import CandidateApplicant from "../models/CandidateApplicant.js";
import User from "../models/User.js";
import fs from "fs";
import { sendEmail } from "../utils/mailer.js";
import mongoose from "mongoose";

export const addCandidateApplicant = async (req, res) => {
  try {
    const { Degree_names, party_id, applied_seats, notes } = req.body;
    const userId = req.user.id;

    if (!Degree_names || !applied_seats || !notes) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const Degree_Dcoments = req.files ? req.files.map(file => file.path) : [];
    
    if (!Degree_Dcoments || Degree_Dcoments.length === 0) {
      return res.status(400).json({ message: "At least one document (degree file) must be uploaded" });
    }

    const newCandidate = await CandidateApplicant.create({
      userId,
      Degree_names: Array.isArray(Degree_names) ? Degree_names : [Degree_names],
      Degree_Dcoments,
      party_id: party_id || null,
      applied_seats,
      notes,
    });

    const user = await User.findById(userId);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: "Candidate Documents Submitted",
        text: `Hello ${user.name},\n\nYour documents for ${applied_seats} have been submitted successfully.`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Candidate added, documents saved, and email sent successfully",
      data: newCandidate,
    });
  } catch (error) {
    console.error("Add candidate error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteCandidateApplicant = async (req, res) => {
  try {
    const candidate = await CandidateApplicant.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (candidate.Degree_Dcoments && candidate.Degree_Dcoments.length > 0) {
      candidate.Degree_Dcoments.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await candidate.deleteOne();

    res.status(200).json({ success: true, message: "Candidate and documents deleted successfully" });
  } catch (error) {
    console.error("Delete candidate error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllCandidatesApplicant = async (req, res) => {
  try {
    const candidates = await CandidateApplicant.find()
      .populate("userId", "name email age constituency")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    console.error("Get all candidates error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCandidatesApplicantByParty = async (req, res) => {
  try {
    const { partyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      return res.status(400).json({ message: "Invalid party ID" });
    }

    const candidates = await CandidateApplicant.find({ party_id: partyId })
      .populate("userId", "name email age constituency")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    console.error("Get candidates by party error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyCandidateApplicantDetails = async (req, res) => {
  try {
    const candidate = await CandidateApplicant.findOne({ userId: req.user.id })
      .populate("userId", "name email age constituency");

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found for this user" });
    }

    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    console.error("Get my candidate details error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
