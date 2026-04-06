import mongoose from "mongoose";
import Vote from "../models/Votes.js"; 
import User from "../models/User.js";
import Candidate from "../models/Candidate.js";
export const castVote = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userID = req.user._id;   // ✅ FIXED
    const { candidateID } = req.body;

    const voter = await User.findById(userID);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    if (!voter.constituency_na_id && !voter.constituency_pp_id) {
      return res.status(400).json({ message: "Voter constiteuncy not found" });
    }

    const candidate = await Candidate.findById(candidateID);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // Validate the voter resides in the exact constituency the candidate is running in
    let isVoterEligible = false;
    if (candidate.applied_seats === "MNA" && voter.constituency_na_id?.toString() === candidate.voting_area?.toString()) {
      isVoterEligible = true;
    } else if (candidate.applied_seats === "MPA" && voter.constituency_pp_id?.toString() === candidate.voting_area?.toString()) {
      isVoterEligible = true;
    }

    if (!isVoterEligible) {
      return res.status(400).json({
        message: "You cannot vote outside your constituency",
      });
    }

    const position = candidate.applied_seats;

    const existingVote = await Vote.findOne({ userID, position });
    if (existingVote) {
      return res.status(400).json({
        message: `You have already voted for ${position}`,
      });
    }

    const vote = new Vote({
      userID,
      candidateID,
      constituencyID: candidate.voting_area,
      position,
    });

    await vote.save();

    res.status(201).json({ message: "Vote cast successfully", vote });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFullConstituencyResults = async (req, res) => {
  try {
 const { constituencyID } = req.params;
    if (!constituencyID) {
      return res.status(400).json({
        message: "constituencyID is required",
      });
    }

    const objectConstituencyID =
      new mongoose.Types.ObjectId(constituencyID);

    const positions = ["MNA", "MPA"];

    let finalResponse = {
      success: true,
      constituencyID,
      totalVotes: {},
      results: {},
    };

    for (let position of positions) {

      // 🔹 Total Votes Per Position
      const totalVotesResult = await Vote.aggregate([
        {
          $match: {
            constituencyID: objectConstituencyID,
            position,
          },
        },
        { $count: "totalVotes" },
      ]);

      const totalVotes =
        totalVotesResult.length > 0
          ? totalVotesResult[0].totalVotes
          : 0;

      finalResponse.totalVotes[position] = totalVotes;

      if (totalVotes === 0) {
        finalResponse.results[position] = [];
        continue;
      }

      // 🔹 Candidate-wise Count
      const results = await Vote.aggregate([
        {
          $match: {
            constituencyID: objectConstituencyID,
            position,
          },
        },
        {
          $group: {
            _id: "$candidateID",
            votes: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "candidates",
            localField: "_id",
            foreignField: "_id",
            as: "candidate",
          },
        },
        { $unwind: "$candidate" },
        {
          $lookup: {
            from: "users",
            localField: "candidate.userId",
            foreignField: "_id",
            as: "candidateUser",
          },
        },
        { $unwind: "$candidateUser" },
        {
          $project: {
            _id: 0,
            candidateID: "$_id",
            candidateName: "$candidateUser.name",
            party: {
              $ifNull: ["$candidate.party_name", "Independent"],
            },
            votes: 1,
          },
        },
        { $sort: { votes: -1 } },
      ]);

      // 🔹 Add Percentage
      const withPercentage = results.map((item) => ({
        ...item,
        percentage: Number(
          ((item.votes / totalVotes) * 100).toFixed(2)
        ),
      }));

      finalResponse.results[position] = withPercentage;
    }

    res.json(finalResponse);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};