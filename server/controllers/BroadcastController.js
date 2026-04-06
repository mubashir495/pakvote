import { Message } from "../models/Broadcast.js";
import User from "../models/User.js";
import Party from "../models/Party.js";
import Candidate from "../models/Candidate.js";

const getUserPartyId = async (user) => {
  if (user.role === "party" || user.role === "admin") {
    const party = await Party.findOne({ userId: user._id });
    return party ? party._id : null;
  } else if (user.role === "candidate") {
    const candidate = await Candidate.findOne({ userId: user._id });
    return candidate ? candidate.party_id : null;
  }
  return null;
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver_type, receiver_ids, message } = req.body;
    const sender = req.user;

    // 🔒 Validation
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (
      (receiver_type === "single" || receiver_type === "multiple") &&
      (!receiver_ids || receiver_ids.length === 0)
    ) {
      return res.status(400).json({
        message: "receiver_ids required for single/multiple",
      });
    }

    // 🚫 Send Logic (Candidate can send to Admin OR other Candidates in same party)
    let finalReceiverIds = receiver_ids;

    // Resolve true party identity
    const partyId = await getUserPartyId(sender);

    // 📦 Create message
    const senderRole = sender.role === "party" ? "admin" : sender.role;

    const newMessage = await Message.create({
      sender_id: sender._id,
      sender_role: senderRole,
      receiver_type:
        sender.role === "candidate" ? "single" : receiver_type,
      receiver_ids:
        receiver_type === "broadcast" ? [] : finalReceiverIds,
      message,
      isBroadcast: receiver_type === "broadcast",
      party_id: partyId,
    });

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ GET MESSAGES (Inbox)
export const getMessages = async (req, res) => {
  try {
    const user = req.user;
    const partyId = await getUserPartyId(user);
    let messages;

    if (user.role === "admin" || user.role === "party") {
      // Admin/party sees all party messages
      messages = await Message.find({
        party_id: partyId,
      })
        .populate("sender_id", "name role")
        .sort({ createdAt: -1 });

    } else {
      // Candidate sees:
      // 1. Messages sent to them
      // 2. Broadcast messages
      messages = await Message.find({
        party_id: partyId,
        $or: [
          { receiver_ids: user._id },
          { isBroadcast: true },
          { sender_id: user._id } // their own sent messages
        ],
      })
        .populate("sender_id", "name role")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ GET SINGLE CONVERSATION (Admin ↔ Candidate)
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params; // candidate id
    const currentUser = req.user;
    const partyId = await getUserPartyId(currentUser);

    const messages = await Message.find({
      party_id: partyId,
      $or: [
        {
          sender_id: currentUser._id,
          receiver_ids: userId,
        },
        {
          sender_id: userId,
          receiver_ids: currentUser._id,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender_id", "name role");

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const user = req.user;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Add user to readBy if not already
    if (!message.readBy.includes(user._id)) {
      message.readBy.push(user._id);
      await message.save();
    }

    res.json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ DELETE MESSAGE (Admin only)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const user = req.user;

    if (user.role !== "admin" && user.role !== "party") {
      return res.status(403).json({
        message: "Only admin can delete messages",
      });
    }

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET RECEIVER MESSAGES
export const getMyMessages = async (req, res) => {
  try {
    const user = req.user;
    const partyId = await getUserPartyId(user);

    const messages = await Message.find({
      $or: [
        { receiver_ids: user._id }, // direct messages
        { 
          isBroadcast: true,
          party_id: partyId // ONLY broadcast messages meant for their party 
        },
        { sender_id: user._id } // messages THEY sent
      ],
    })
      .populate("sender_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

// GET CONTACTS (For composing messages)
export const getContacts = async (req, res) => {
  try {
    const user = req.user;
    const partyId = await getUserPartyId(user);
    if (!partyId) {
      return res.status(200).json({ success: true, data: [] });
    }

    let contacts = [];

    // 1. Fetch Party Admin
    const party = await Party.findById(partyId).populate("userId", "_id name role");
    if (party && party.userId && party.userId._id.toString() !== user._id.toString()) {
      contacts.push({
        _id: party.userId._id,
        name: `${party.userId.name} (Party Admin)`,
        role: "admin"
      });
    }

    // 2. Fetch all other candidates in the same party
    const partyCandidates = await Candidate.find({ party_id: partyId })
      .populate("userId", "_id name role");

    partyCandidates.forEach((cand) => {
      if (cand.userId && cand.userId._id.toString() !== user._id.toString()) {
        contacts.push({
          _id: cand.userId._id,
          name: `${cand.userId.name} (Candidate ${cand.applied_seats})`,
          role: "candidate"
        });
      }
    });

    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


