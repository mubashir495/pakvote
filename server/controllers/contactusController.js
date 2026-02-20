import Contact from "../models/ContactUs.js";

export const createContactMessage = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newMessage = await Contact.create({
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create contact error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get all contacts error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};


export const getSingleContactMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get single contact error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const deleteContactMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
