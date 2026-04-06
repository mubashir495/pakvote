import Settings from "../models/Settings.js";

// GET global settings (start/end times) - Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE global settings - Admin Only
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }
    
    const {
      candidate_startTime, candidate_endTime,
      party_startTime, party_endTime,
      voting_startTime, voting_endTime,
    } = req.body;

    if (candidate_startTime !== undefined) settings.candidate_startTime = candidate_startTime;
    if (candidate_endTime !== undefined) settings.candidate_endTime = candidate_endTime;
    if (party_startTime !== undefined) settings.party_startTime = party_startTime;
    if (party_endTime !== undefined) settings.party_endTime = party_endTime;
    if (voting_startTime !== undefined) settings.voting_startTime = voting_startTime;
    if (voting_endTime !== undefined) settings.voting_endTime = voting_endTime;

    await settings.save();
    return res.status(200).json({ success: true, message: "Settings updated successfully", data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkPhaseMiddleware = (phase) => {
  return async (req, res, next) => {
    try {
      const settings = await Settings.findOne();
      
      const now = new Date();
      let startTime, endTime;

      if (settings) {
        if (phase === "candidate") {
          startTime = settings.candidate_startTime;
          endTime = settings.candidate_endTime;
        } else if (phase === "party") {
          startTime = settings.party_startTime;
          endTime = settings.party_endTime;
        } else if (phase === "voting") {
          startTime = settings.voting_startTime;
          endTime = settings.voting_endTime;
        }
      }

      if (!startTime || !endTime) {
        return res.status(403).json({ success: false, message: `The ${phase} phase has not been scheduled yet.` });
      }

      if (now < new Date(startTime)) {
        return res.status(403).json({ success: false, message: `The ${phase} phase has not started yet.` });
      }

      if (now > new Date(endTime)) {
        return res.status(403).json({ success: false, message: `The ${phase} phase has already ended.` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error checking phase timings" });
    }
  };
};
