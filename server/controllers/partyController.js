import Party from "../models/Party.js";
import mongoose from "mongoose";

// CREATE PARTY APPLICATION
// CREATE PARTY (Final Approval)
export const createParty = async (req, res) => {
  try {
    const { userId, party_name, party_admin_name, party_Symbol } = req.body;

    // Validate required fields
    if (!userId || !party_name || !party_admin_name || !party_Symbol) {
      return res.status(400).json({
        message: "All fields (User, Party Name, Admin Name, Symbol) are required",
      });
    }

    // Check if Party Name already exists
    const existingParty = await Party.findOne({ party_name });
    if (existingParty) {
      return res.status(400).json({ message: "Party Name already taken" });
    }

    // Create New Party
    const newParty = await Party.create({
      userId,
      party_name,
      party_admin_name,
      party_Symbol,
    });

    res.status(201).json({
      success: true,
      message: "Party created successfully",
      data: newParty,
    });
  } catch (error) {
    console.error("Create Party Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// GET ALL APPLICATIONS (ADMIN)
export const getAllParties = async (req, res) => {
  try {
    const applicants = await Party.find()
      .populate("userId", "name email") // 🔥 IMPORTANT FIX
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applicants.length,
      data: applicants,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// GET SINGLE APPLICATION
export const getSingleParty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Application ID" });
    }

    const applicant = await PartyApplicant.findById(id)
      .populate("userId", "name email");

    if (!applicant) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: applicant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// UPDATE STATUS (APPROVE / REJECT)
export const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Application ID",
      });
    }

    const applicant = await PartyApplicant.findById(id);

    if (!applicant) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    applicant.status = status;
    await applicant.save();

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: applicant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


// DELETE APPLICATION

export const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Application ID",
      });
    }

    const applicant = await PartyApplicant.findById(id);

    if (!applicant) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    await applicant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
