import Party from "../models/Party.js";
import mongoose from "mongoose";

export const createParty = async (req, res) => {
  try {
    const { party_name, party_admin_name, party_Symbol } = req.body;

    const userId = req.user?.id; // assuming JWT middleware sets req.user

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    if (!party_name || !party_admin_name) {
      return res.status(400).json({
        message: "Party name and admin name are required",
      });
    }

    // Check if party already exists
    const existingParty = await Party.findOne({ party_name });
    if (existingParty) {
      return res.status(400).json({
        message: "Party with this name already exists",
      });
    }

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
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find()
      .populate("userId", "name email")
      .populate("party_Symbol");

    res.status(200).json({
      success: true,
      count: parties.length,
      data: parties,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


export const getSingleParty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Party ID" });
    }

    const party = await Party.findById(id)
      .populate("userId", "name email")
      .populate("party_Symbol");

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.status(200).json({
      success: true,
      data: party,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


export const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { party_name, party_admin_name, party_Symbol } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Party ID" });
    }

    const party = await Party.findById(id);

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Optional: Check if logged-in user owns this party
    if (party.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to update this party",
      });
    }

    party.party_name = party_name || party.party_name;
    party.party_admin_name = party_admin_name || party.party_admin_name;
    party.party_Symbol = party_Symbol || party.party_Symbol;

    const updatedParty = await party.save();

    res.status(200).json({
      success: true,
      message: "Party updated successfully",
      data: updatedParty,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


export const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Party ID" });
    }

    const party = await Party.findById(id);

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    if (party.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this party",
      });
    }

    await party.deleteOne();

    res.status(200).json({
      success: true,
      message: "Party deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
