import Party from "../models/Party.js";
import Candidate from "../models/Candidate.js";
import Vote from "../models/Votes.js";
import mongoose from "mongoose";

export const createParty = async (req, res) => {
  try {
    const { userId, party_name, party_admin_name, party_Symbol } = req.body;
    if (!userId || !party_name || !party_admin_name || !party_Symbol) {
      return res.status(400).json({
        message: "All fields (User, Party Name, Admin Name, Symbol) are required",
      });
    }
    const existingParty = await Party.findOne({ party_name });
    if (existingParty) {
      return res.status(400).json({ message: "Party Name already taken" });
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
      .populate("userId", "name email") 
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

    const applicant = await Party.findById(id)
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

// get party using userid 
export const getPartyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
     if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }
    const party = await Party.findOne({ userId })
      .populate("userId", "name email")
      .populate("party_Symbol");

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "No party found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: party,
    });

  } catch (error) {
    console.error("Get Party By UserId Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get all candidates of my party
export const getMyPartyCandidates = async (req, res) => {
  try {
    const userId = req.user._id;
    const party = await Party.findOne({ userId });

    if (!party) {
       return res.status(404).json({ success: false, message: "Party not found" });
    }

    const candidates = await Candidate.find({ party_id: party._id })
      .populate("userId", "name email cnic_no")
      .populate("voting_area", "name")
      .populate("symbol_id", "name image");

    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get mpa results for party's candidates
export const getMyPartyMPAResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const party = await Party.findOne({ userId });

    if (!party) {
       return res.status(404).json({ success: false, message: "Party not found" });
    }

    const candidates = await Candidate.find({ party_id: party._id, applied_seats: "MPA" })
      .populate("userId", "name")
      .populate("voting_area", "name");

    const results = [];

    for (let candidate of candidates) {
       const constituencyID = candidate.voting_area ? candidate.voting_area._id : null;
       if (!constituencyID) continue;

       const votesAggr = await Vote.aggregate([
          { $match: { constituencyID: constituencyID, position: "MPA" } },
          { $group: { _id: "$candidateID", votes: { $sum: 1 } } },
          { $sort: { votes: -1 } }
       ]);

       let myVotes = 0;
       let status = "Pending/Lost";
       if (votesAggr.length > 0) {
          const winnerId = votesAggr[0]._id.toString();
          const myResult = votesAggr.find(r => r._id.toString() === candidate._id.toString());
          if (myResult) {
            myVotes = myResult.votes;
          }
          if (winnerId === candidate._id.toString()) {
            status = "Winner";
          } else {
            status = "Lost";
          }
       }

       results.push({
          candidateId: candidate._id,
          candidateName: candidate.userId ? candidate.userId.name : "Unknown",
          constituency: candidate.voting_area ? candidate.voting_area.name : "Unknown",
          votes: myVotes,
          status: status
       });
    }

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
