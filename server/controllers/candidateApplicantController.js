import CandidateApplicant from "../models/CandidateApplicant.js";
import User from "../models/User.js";
import fs from "fs";
import mongoose from "mongoose";
import { sendEmail } from "../utils/mailer.js";

export const addCandidateApplicant = async (req, res) => {
  try {
    const { notes, party, isApplyForSeat } = req.body;
    const userId = req.user.id;

    // Prevent multiple applications
    const existing = await CandidateApplicant.findOne({ userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied"
      });
    }

    if (!notes?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notes field is required"
      });
    }

    if (!["MPA", "MNA"].includes(isApplyForSeat)) {
      return res.status(400).json({
        success: false,
        message: "Seat must be MPA or MNA"
      });
    }

    const degreeDocuments = req.files?.map(file => file.path) || [];

    if (degreeDocuments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one degree document required"
      });
    }

    const degreeNames = [];
    Object.keys(req.body).forEach(key => {
      const match = key.match(/degrees\[(\d+)\]\[name\]/);
      if (match && req.body[key]?.trim()) {
        degreeNames.push(req.body[key].trim());
      }
    });

    const newCandidate = await CandidateApplicant.create({
      userId,
      Degree_names: degreeNames.length ? degreeNames : ["Unspecified"],
      Degree_Documents: degreeDocuments,
      party_id: party || null,
      applied_seats: isApplyForSeat,
      notes: notes.trim(),
      status: "Pending"
    });

    // Send Email
    const user = await User.findById(userId);
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: "Application Submitted Successfully",
        text: `Hello ${user.name},
        
Your candidate application for ${isApplyForSeat} has been submitted successfully.
Status: Pending

Thank you!`
      });
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: newCandidate
    });

  } catch (error) {
    console.error("Apply error:", error.message);

    if (req.files?.length > 0) {
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

    // Delete files
    candidate.Degree_Documents.forEach(path => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
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


export const getAllCandidatesApplicant = async (req, res) => {
  try {
    const candidates = await CandidateApplicant.find()
      .populate("userId", "name email age constituency")
      .populate("party_id", "party_name")
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


export const getCandidatesApplicantByParty = async (req, res) => {
  try {
    const { partyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid party ID"
      });
    }

    const candidates = await CandidateApplicant.find({
      party_id: partyId
    })
      .populate("userId", "name email age constituency")
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


export const getMyCandidateApplicantDetails = async (req, res) => {
  try {
    const candidate = await CandidateApplicant.findOne({
      userId: req.user.id
    })
      .populate("userId", "name email age constituency")
      .populate("party_id", "party_name");

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
        message: "Status must be Approved or Rejected"
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
    if (adminNotes) {
      candidate.notes = adminNotes;
    }

    await candidate.save();

    // Send email to user
    if (candidate.userId?.email) {
      await sendEmail({
        to: candidate.userId.email,
        subject: `Application ${status}`,
        text: `Hello ${candidate.userId.name},
        
Your candidate application has been ${status}.

Admin Notes:
${adminNotes || "No additional comments"}

Thank you.`
      });
    }

    res.status(200).json({
      success: true,
      message: `Candidate ${status} successfully`,
      data: candidate
    });

  } catch (error) {
    console.error("Status update error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};
