import PartyApplicant from "../models/partyAppllicant.js";
import { sendEmail } from "../utils/mailer.js";

export const createPartyApplicant = async (req, res) => {
  try {
    const {
      party_name,
      party_admin_name,
      notes,
      party_members,
      party_office_bearers,
      payment,
    } = req.body;

    if (
      !req.files?.payement_prof ||
      !req.files?.party_constitution_document
    ) {
      return res.status(400).json({
        message: "Payment proof and constitution document are required",
      });
    }

    const newApplicant = await PartyApplicant.create({
      userId: req.user._id,
      party_name,
      party_admin_name,
      notes,
      party_members: JSON.parse(party_members),
      party_office_bearers: JSON.parse(party_office_bearers),
      payment: {
        ...JSON.parse(payment),
        proof_image: req.files.payement_prof[0].path,
      },
      party_constitution_document:
        req.files.party_constitution_document[0].path,
    });

    await sendEmail({
      to: req.user.email,
      subject: "Party Registration Submitted",
      text: `Your party "${party_name}" application has been submitted successfully and is under review.`,
    });

    res.status(201).json({
      message: "Party application submitted successfully",
      data: newApplicant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get
export const getAllPartyApplicants = async (req, res) => {
  try {
    const applicants = await PartyApplicant.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get single 
export const getPartyApplicantById = async (req, res) => {
  try {
    const applicant = await PartyApplicant.findById(req.params.id)
      .populate("userId", "name email");

    if (!applicant) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(applicant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update 
export const updatePartyStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;

    const applicant = await PartyApplicant.findById(req.params.id).populate(
      "userId",
      "email name"
    );

    if (!applicant) {
      return res.status(404).json({ message: "Application not found" });
    }

    applicant.status = status;
    applicant.reviewed_by = req.user._id;

    if (status === "rejected") {
      applicant.rejection_reason = rejection_reason;
    }

    await applicant.save();

    //  Email notification
    await sendEmail({
      to: applicant.userId.email,
      subject: `Party Application ${status.toUpperCase()}`,
      text:
        status === "approved"
          ? `Congratulations! Your party "${applicant.party_name}" has been approved.`
          : `Your party "${applicant.party_name}" was rejected.\nReason: ${rejection_reason}`,
    });

    res.json({
      message: `Application ${status} successfully`,
      applicant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete 
export const deletePartyApplicant = async (req, res) => {
  try {
    const applicant = await PartyApplicant.findByIdAndDelete(req.params.id);

    if (!applicant) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
