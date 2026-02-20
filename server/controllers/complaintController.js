import Complaint from "../models/Comaplaint.js";

export const createComplaint = async (req, res) => {
  try {
     console.log("Request Body:", req.body);
    const { email, complaint_type, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Email, Subject and Message are required" });
    }

    const complaint = await Complaint.create({ email, complaint_type, subject, message });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ✅ Get All Complaints
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



// ✅ Get Single Complaint
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid ID",
      error: error.message,
    });
  }
};



// ✅ Delete Complaint
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid ID",
      error: error.message,
    });
  }
};
