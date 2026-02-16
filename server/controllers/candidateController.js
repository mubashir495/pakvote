import Candidate from "../models/Candidate.js";
import User from "../models/User.js";

export const createCandidateApplicant = async (req, res) => {
  try {
    const { userId, party_id, applied_seats, symbol_id } = req.body;

    if (!userId || !applied_seats) {
      return res.status(400).json({
        success: false,
        message: "userId and applied_seats are required",
      });
    }

    // For independent candidates, symbol_id is required
    if (!party_id && !symbol_id) {
      return res.status(400).json({
        success: false,
        message: "Independent candidates must have a symbol",
      });
    }

    const alreadyApplied = await Candidate.findOne({ userId });
    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "User already applied as candidate",
      });
    }

    // Check if symbol is already used (only for independent candidates)
    if (symbol_id) {
      const symbolUsed = await Candidate.findOne({ symbol_id });
      if (symbolUsed) {
        return res.status(409).json({
          success: false,
          message: "Symbol already assigned",
        });
      }
    }

    // ✅ Create application
    const applicant = await Candidate.create({
      userId,
      party_id: party_id || null,
      applied_seats,
      symbol_id: symbol_id || null,
    });

    // ✅ Update user role → candidate
    await User.findByIdAndUpdate(userId, { role: "candidate" });

    res.status(201).json({
      success: true,
      message: "Candidate application created",
      data: applicant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

/* =====================================================
   UPDATE APPLICATION
===================================================== */
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

/* =====================================================
   DELETE APPLICATION (REVERT ROLE)
===================================================== */
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
