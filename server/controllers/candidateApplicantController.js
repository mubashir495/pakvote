import CandidateApplicant from "../models/CandidateApplicant.js";
import User from "../models/User.js";
import fs from "fs";
import mongoose from "mongoose";
import { sendEmail } from "../utils/mailer.js";

// ---------------- Add Candidate Applicant ----------------
export const addCandidateApplicant = async (req, res) => {
  try {
    const {
      notes,
      party_id,
      isApplyForSeat,
      assets,
      hasCriminalRecord,
      criminalDetails,
      isIndependent
    } = req.body;

    const userId = req.user.id;

    // 🔒 ONLY ONE APPLICATION (MPA or MNA)
    const existing = await CandidateApplicant.findOne({ userId });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already applied for ${existing.applied_seats}. Only ONE application is allowed.`
      });
    }

    // 🧾 Basic Validation
    if (!notes?.trim()) {
      return res.status(400).json({ success: false, message: "Notes required" });
    }

    if (!assets?.trim()) {
      return res.status(400).json({ success: false, message: "Assets required" });
    }

    if (!["MPA", "MNA"].includes(isApplyForSeat)) {
      return res.status(400).json({ success: false, message: "Invalid seat type" });
    }

    // 👤 Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔞 Age check
    if (user.age < 25) {
      return res.status(400).json({
        success: false,
        message: "Minimum age is 25"
      });
    }

    if (!user.cnic_no) {
      return res.status(400).json({
        success: false,
        message: "CNIC required in profile"
      });
    }

    // 🗳 Voting Area + Model
    let voting_area = null;
    let voting_area_model = null;

    if (isApplyForSeat === "MNA") {
      voting_area = user.constituency_na_id;
      voting_area_model = "ConstituencyNA";
    } else {
      voting_area = user.constituency_pp_id;
      voting_area_model = "ConstituencyPP";
    }

    if (!voting_area) {
      return res.status(400).json({
        success: false,
        message: "User constituency not found"
      });
    }

    // 📄 Degree validation
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Degree documents required"
      });
    }

    const degrees = [];

    req.files.forEach((file, index) => {
      let name = req.body[`degrees[${index}][name]`];

      if (!name && req.body.degrees) {
        if (Array.isArray(req.body.degrees) && req.body.degrees[index]) {
          name = req.body.degrees[index].name;
        } else if (req.body.degrees.name) {
          name = req.body.degrees.name;
        }
      }

      if (!name || typeof name !== "string" || !name.trim()) {
        throw new Error(`Degree name missing for file ${index + 1}`);
      }

      degrees.push({
        name: name.trim(),
        document: file.path
      });
    });

    // 🧾 Create Candidate Application
    const candidate = await CandidateApplicant.create({
      userId,
      degrees,
      party_id: isIndependent === "true" ? null : party_id || null,
      isIndependent: isIndependent === "true",
      applied_seats: isApplyForSeat,
      voting_area,
      voting_area_model,
      assets: assets.trim(),
      hasCriminalRecord: hasCriminalRecord || false,
      criminalDetails: hasCriminalRecord ? criminalDetails : "",
      notes: notes.trim(),
      status: "Pending"
    });

    // 📧 Email Notification
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Application Submitted",
        text: `Hello ${user.name}, your application for ${isApplyForSeat} has been submitted successfully.\nStatus: Pending`
      });
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: candidate
    });

  } catch (error) {
    console.error("Apply error:", error.message);

    // 🧹 Cleanup uploaded files
    if (req.files?.length) {
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

// ---------------- Delete Candidate Applicant ----------------
export const deleteCandidateApplicant = async (req, res) => {
  try {
    const candidate = await CandidateApplicant.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    if (
      candidate.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // 🧹 Delete files
    candidate.degrees.forEach(deg => {
      if (fs.existsSync(deg.document)) {
        fs.unlinkSync(deg.document);
      }
    });

    await candidate.deleteOne();

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully"
    });

  } catch (error) {
    console.error("Delete error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// ---------------- Get All Candidates ----------------
export const getAllCandidatesApplicant = async (req, res) => {
  try {
    const candidates = await CandidateApplicant.find()
      .populate("userId", "name email cnic_no age")
      .populate("party_id", "party_name")
      .populate("voting_area")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// ---------------- Get Candidates by Party ----------------
export const getCandidatesApplicantByParty = async (req, res) => {
  try {
    const { partyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid party ID"
      });
    }

    const candidates = await CandidateApplicant.find({ party_id: partyId })
      .populate("userId", "name email")
      .populate("voting_area")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// ---------------- Get My Candidate ----------------
export const getMyCandidateApplicantDetails = async (req, res) => {
  try {
    const candidate = await CandidateApplicant.findOne({
      userId: req.user.id
    })
      .populate("userId", "name email cnic_no age")
      .populate("party_id", "party_name")
      .populate("voting_area");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "No application found"
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// ---------------- Update Candidate Status (Admin) ----------------
export const updateCandidateStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update status"
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const candidate = await CandidateApplicant.findById(id)
      .populate("userId", "email name");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    candidate.status = status;
    if (adminNotes) candidate.notes = adminNotes;
    candidate.approvedBy = req.user.id;
    candidate.approvedAt = new Date();

    await candidate.save();

    // 📧 Email
    if (candidate.userId?.email) {
      await sendEmail({
        to: candidate.userId.email,
        subject: `Application ${status}`,
        text: `Hello ${candidate.userId.name},\nYour application has been ${status}.\n\nAdmin Notes:\n${adminNotes || "No comments"}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Candidate ${status} successfully`,
      data: candidate
    });

  } catch (error) {
    console.error("Status error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};