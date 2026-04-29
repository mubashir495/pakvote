import Candidate from "../models/Candidate.js";
import User from "../models/User.js";
import Symbol from "../models/Symbol.js";
import Party from "../models/Party.js";
import mongoose from "mongoose";
import Vote from "../models/Votes.js";


// CREATE CANDIDATE
export const createCandidate = async (req, res) => {
  try {
    const { userId, party_id, symbol_id, voting_area, applied_seats, voting_area_model } = req.body;
    const alreadyCandidate = await Candidate.findOne({ userId });
    if (alreadyCandidate) {
      return res.status(400).json({ 
        success: false, 
        message: "This user is already registered as a candidate." 
      });
    }

    let assignedSymbol = null;

    // 2. INDEPENDENT VS PARTY LOGIC
    if (!party_id) {
      // Rule: Independent MUST have a symbol
      if (!symbol_id) {
        return res.status(400).json({ 
          success: false, 
          message: "Independent candidates must select a symbol." 
        });
      }

      // 3. CONSTITUENCY SYMBOL CHECK: 
      // Rule: Same area + Same seat + Same symbol = NOT ALLOWED
      const symbolConflict = await Candidate.findOne({
        symbol_id: symbol_id,
        voting_area: voting_area,
        applied_seats: applied_seats
      });

      if (symbolConflict) {
        return res.status(400).json({ 
          success: false, 
          message: "This symbol is already taken by another candidate in this constituency." 
        });
      }
      
      assignedSymbol = symbol_id;
    } else {
      // Rule: Party candidates don't store a personal symbol_id
      assignedSymbol = null;
    }

    // 4. SAVE TO DATABASE
    const newCandidate = await Candidate.create({
      userId,
      party_id: party_id || null,
      symbol_id: assignedSymbol,
      voting_area,
      applied_seats,
      voting_area_model
    });

    res.status(201).json({
      success: true,
      message: "Candidate registered successfully",
      data: newCandidate
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};   
// GET ALL CANDIDATES
export const getAllCandidateApplicants = async (req, res) => {
  try {

    const applicants = await Candidate.find()
      .populate([
        { path: "userId", select: "name email role" },
        { path: "party_id", select: "party_name" },
        { path: "symbol_id", select: "name image" },
        { path: "voting_area", select: "name" }
      ]);

    res.status(200).json({
      success: true,
      count: applicants.length,
      data: applicants,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET BY ID
export const getCandidateApplicantById = async (req, res) => {
  try {

    const applicant = await Candidate.findById(req.params.id)
      .populate([
        { path: "userId", select: "name email role" },
        { path: "party_id", select: "party_name" },
        { path: "symbol_id", select: "name image" },
        { path: "voting_area", select: "name" }
      ]);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: applicant,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET BY PARTY
export const getCandidatesByParty = async (req, res) => {
  try {

    const { partyID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partyID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Party ID",
      });
    }

    const candidates = await Candidate.find({ party_id: partyID })
      .populate([
        { path: "userId", select: "name email role" },
        { path: "party_id", select: "party_name" },
        { path: "symbol_id", select: "name image" },
        { path: "voting_area", select: "name" }
      ]);

    res.status(200).json({
      success: true,
      total: candidates.length,
      data: candidates,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// INDEPENDENT CANDIDATES
export const getIndependentCandidates = async (req, res) => {
  try {

    const candidates = await Candidate.find({ party_id: null })
      .populate([
        { path: "userId", select: "name email role" },
        { path: "symbol_id", select: "name image" },
        { path: "voting_area", select: "name" }
      ]);

    res.status(200).json({
      success: true,
      data: candidates,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// UPDATE
export const updateCandidateApplicant = async (req, res) => {
  try {

    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Candidate updated",
      data: updated,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// DELETE
export const deleteCandidateApplicant = async (req, res) => {
  try {

    const applicant = await Candidate.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    await User.findByIdAndUpdate(applicant.userId, { role: "user" });

    await applicant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Candidate deleted & role reverted",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// GET CANDIDATE BY USER ID
export const getCandidateByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const candidate = await Candidate.findOne({ userId })
      .populate("userId", "name cnic_no email")
      .populate({
        path: "party_id",
        model: "Party", // ✅ FIXED
        populate: [
          { path: "party_Symbol", model: "Symbol" },
          { path: "userId", model: "User", select: "_id name email" } // ✅ party owner
        ],
      })
      .populate("symbol_id");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    let responseData = {
      candidateId: candidate._id,
      applied_seats: candidate.applied_seats,

      user: {
        name: candidate.userId?.name || null,
        cnic_no: candidate.userId?.cnic_no || null,
      },
    };

    // ✅ PARTY CASE
    if (candidate.party_id && candidate.party_id._id) {
      responseData.type = "party";

      responseData.party = {
        partyId: candidate.party_id._id, // ✅ added
        partyUserId: candidate.party_id.userId?._id || null, // ✅ added
        partyName: candidate.party_id.party_name,

        partySymbol: {
          name: candidate.party_id.party_Symbol?.name || null,
          image: candidate.party_id.party_Symbol?.image || null,
        },

        partyAdminName: candidate.party_id.party_admin_name || null,
      };

    } 
    // ✅ INDEPENDENT CASE
    else {
      responseData.type = "independent";

      responseData.independent = {
        symbol: {
          name: candidate.symbol_id?.name || null,
          image: candidate.symbol_id?.image || null,
        },
      };
    }

    return res.status(200).json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error("ERROR ", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// get candidate by constituency
export const getCandidatesByBothConstituencies = async (req, res) => {
  try {
    const { naId, ppId } = req.query; 

    const orConditions = [];
    if (naId) orConditions.push({ voting_area: naId });
    if (ppId) orConditions.push({ voting_area: ppId });

    if (orConditions.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const candidates = await Candidate.find({
      $or: orConditions
    })
    .populate([
      { path: "userId", select: "name father_name cnic_no email constituency_na_id constituency_pp_id" },
      { path: "symbol_id", select: "name image" },
      {
        path: "party_id",
        select: "party_name party_Symbol",
        populate: {
          path: "party_Symbol",
          select: "name image"
        }
      }
    ]).lean();

    const candidatesWithVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const totalVotes = await Vote.countDocuments({ candidateID: candidate._id });
        return { ...candidate, totalVotes };
      })
    );

    res.status(200).json({
      success: true,
      count: candidatesWithVotes.length,
      data: candidatesWithVotes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET PARTY CANDIDATES BY USER
export const getPartyCandidatesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
console.log("USER ID:", userId);
console.log("Is valid ObjectId?", mongoose.Types.ObjectId.isValid(userId));
console.log(req.params);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    // Find party by user
    const party = await Party.findOne({ userId });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found for this user",
      });
    }

    // Get candidates of this party
    const candidates = await Candidate.find({ party_id: party._id })
      .populate({
        path: "userId",
        select: "name email constituency_id",
      })
      .populate({
  path: "userId",
  select: "name email constituency_na_id constituency_pp_id",
  populate: [
    {
      path: "constituency_na_id",
      select: "name",
    },
    {
      path: "constituency_pp_id",
      select: "name",
    },
  ],
})
    
      .populate([
        { path: "party_id", select: "party_name" },
        { path: "symbol_id", select: "name image" },
      ]);

    return res.status(200).json({
      success: true,
      total: candidates.length,
      party: party.party_name,
      data: candidates,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET OWN PROFILE (Candidate)
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const candidate = await Candidate.findOne({ userId })
      .populate("userId", "name cnic_no email")
      .populate({
        path: "party_id",
        model: "Party", 
        populate: [
          { path: "party_Symbol", model: "Symbol" },
          { path: "userId", model: "User", select: "_id name email" } 
        ],
      })
      .populate("symbol_id");

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    let responseData = {
      candidateId: candidate._id,
      applied_seats: candidate.applied_seats,
      user: {
        name: candidate.userId?.name || null,
        cnic_no: candidate.userId?.cnic_no || null,
        email: candidate.userId?.email || null,
      },
    };

    if (candidate.party_id && candidate.party_id._id) {
      responseData.type = "party";
      responseData.party = {
        partyId: candidate.party_id._id, 
        partyUserId: candidate.party_id.userId?._id || null, 
        partyName: candidate.party_id.party_name,
        partySymbol: {
          name: candidate.party_id.party_Symbol?.name || null,
          image: candidate.party_id.party_Symbol?.image || null,
        },
        partyAdminName: candidate.party_id.party_admin_name || null,
      };
    } else {
      responseData.type = "independent";
      responseData.independent = {
        symbol: {
          name: candidate.symbol_id?.name || null,
          image: candidate.symbol_id?.image || null,
        },
      };
    }

    return res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET CANDIDATE OWN MPA RESULT
export const getCandidateOwnResult = async (req, res) => {
  try {
     const candidate = await Candidate.findOne({ userId: req.user._id })
       .populate("voting_area", "name");
     if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });

     if (candidate.applied_seats !== 'MPA') {
       return res.status(400).json({ success: false, message: "You are not an MPA candidate" });
     }

     const results = await Vote.aggregate([
        { $match: { constituencyID: candidate.voting_area._id, position: candidate.applied_seats } },
        { $group: { _id: "$candidateID", votes: { $sum: 1 } } },
        { $sort: { votes: -1 } }
     ]);

     let status = "Pending";
     let myVotes = 0;
     let winner = null;
     if (results.length > 0) {
       winner = results[0]._id.toString();
       const myResult = results.find(r => r._id.toString() === candidate._id.toString());
       myVotes = myResult ? myResult.votes : 0;
       status = (winner === candidate._id.toString()) ? "Winner" : "Lost";
     }

     res.status(200).json({
       success: true,
       data: {
         applied_seat: candidate.applied_seats,
         constituency: candidate.voting_area.name,
         myVotes,
         status,
         won: winner === candidate._id.toString()
       }
     });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};