import Candidate from "../models/Candidate.js";
import User from "../models/User.js";
import Symbol from "../models/Symbol.js";
export const createCandidateApplicant = async (req, res) => {
  try {
    const { userId, party_id, applied_seats, symbol_id } = req.body;

    // ✅ Required validation
    if (!userId || !applied_seats) {
      return res.status(400).json({
        success: false,
        message: "userId and applied_seats are required",
      });
    }

    if (!["MPA", "MNA"].includes(applied_seats)) {
      return res.status(400).json({
        success: false,
        message: "applied_seats must be MPA or MNA",
      });
    }

    // ✅ Independent candidate must have symbol
    if (!party_id && !symbol_id) {
      return res.status(400).json({
        success: false,
        message: "Independent candidates must have a symbol",
      });
    }

    // ✅ Prevent duplicate application
    const alreadyApplied = await Candidate.findOne({ userId });
    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "User already applied as candidate",
      });
    }

    // ✅ If independent, check symbol exists
    if (symbol_id) {
      const symbolExists = await Symbol.findById(symbol_id);
      if (!symbolExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid symbol selected",
        });
      }

      const symbolUsed = await Candidate.findOne({ symbol_id });
      if (symbolUsed) {
        return res.status(409).json({
          success: false,
          message: "Symbol already assigned",
        });
      }
    }

    // ✅ Create candidate
    const applicant = await Candidate.create({
      userId,
      party_id: party_id || null,
      applied_seats,
      symbol_id: symbol_id || null,
    });

    // ✅ Update user role
    await User.findByIdAndUpdate(userId, { role: "candidate" });

    return res.status(201).json({
      success: true,
      message: "Candidate application created",
      data: applicant,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value detected (symbol or user already exists)",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
export const getAllCandidateApplicants = async (req, res) => {
  try {
    const applicants = await Candidate.find()
      .populate("userId", "name email role")
      .populate("party_id", "name")
      .populate("symbol_id", "name image");

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

export const getCandidateApplicantById = async (req, res) => {
  try {
    const applicant = await Candidate.findById(req.params.id)
      .populate("userId", "name email")
      .populate("party_id", "name")
      .populate("symbol_id", "name image");

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Candidate applicant not found",
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

export const getPartyCandidates = async (req, res) => {
  try {
    const candidates = await CandidateApplicant.find({
      party_id: { $ne: null },
    })
      .populate("userId", "name email")
      .populate("party_id", "name")
      .populate("symbol_id", "name image");

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

export const getIndependentCandidates = async (req, res) => {
  try {
    const candidates = await CandidateApplicant.find({
      party_id: null,
    })
      .populate("userId", "name email")
      .populate("symbol_id", "name image");

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

export const updateCandidateApplicant = async (req, res) => {
  try {
    const updated = await CandidateApplicant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Candidate applicant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Candidate applicant updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCandidateApplicant = async (req, res) => {
  try {
    const applicant = await CandidateApplicant.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Candidate applicant not found",
      });
    }

    // 🔄 revert user role
    await User.findByIdAndUpdate(applicant.userId, { role: "user" });

    await applicant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Candidate applicant deleted & role reverted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCandidateByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const candidate = await Candidate.findOne({ userId })
      .populate({
        path: "party_id",
        populate: [
          { path: "symbol_id", model: "Symbol" },  
          { path: "admin_id", model: "User" }      
        ]
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
    };

    if (candidate.party_id) {
      responseData.party = {
        partyName: candidate.party_id.name,
        partySymbol: candidate.party_id.symbol_id?.name || null,
        partyAdminName: candidate.party_id.admin_id?.name || null,
      };
    } 
    else {
      responseData.independent = {
        symbol: candidate.symbol_id?.name || null,
      };
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// GET candidates by constituency ID
// export const getCandidatesByConstituency = async (req, res) => {
//   try {
//     const { constituencyId } = req.params;

//     if (!constituencyId) {
//       return res.status(400).json({ success: false, message: "Constituency ID is required" });
//     }

//     const candidates = await Candidate.find()
//       .populate({
//         path: "userId",
//         match: { constituency_id: constituencyId }, 
//         select: "name father_name cnic_no email constituency_id",
//       })
//       .populate("party_id", "name") 
//       .populate("symbol_id", "name image"); 

//     const filteredCandidates = candidates.filter(c => c.userId !== null);

//     return res.status(200).json({ success: true, data: filteredCandidates });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };


// GET candidates by constituency ID
export const getCandidatesByConstituency = async (req, res) => {
  try {
    const { constituencyId } = req.params;

    if (!constituencyId) {
      return res.status(400).json({ success: false, message: "Constituency ID is required" });
    }
    const users = await User.find({ constituency_id: constituencyId }).select("_id");
    const userIds = users.map(user => user._id);
    const candidates = await Candidate.find({ userId: { $in: userIds } })
      .populate("party_id", "name") 
      .populate("symbol_id", "name image")
      .populate("userId", "name father_name cnic_no email"); 

    return res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};