import Division from "../models/Division.js";
import slugify from "slugify";
import Province from "../models/Province.js";

export const createDivision = async (req, res) => {
  try {
    const { name, province_id } = req.body;

    if (!name || !province_id) {
      return res.status(400).json({ message: "Name and Province are required" });
    }

    const slug = slugify(name, { lower: true });

    const exists = await Division.findOne({
      $or: [{ name }, { slug }]
    });

    if (exists) {
      return res.status(409).json({ message: "District already exists" });
    }

    const division = await Division.create({
      name,
      slug,
      province_id
    });

    res.status(201).json({
      success: true,
      data: division
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllDivision = async (req, res) => {
  try {
    const divisions = await Division.find()
      .populate("province_id", "name slug")
      .sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      count: divisions.length,
      data: divisions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDivisionById = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id)
      .populate("province_id", "name slug");

    if (!division) {
      return res.status(404).json({ message: "District not found" });
    }

    res.status(201).json({
      success: true,
      data: division
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid District ID" });
  }
};

export const getDivisionByProvince = async (req, res) => {
  try {
    const { id } = req.params; 

    const divisions = await Division.find({ province_id: id })
      .populate("province_id", "name");  

    res.status(200).json({
      success: true,
      count: divisions.length,
      data: divisions,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDivision = async (req, res) => {
  try {
    const { name, province_id } = req.body;

    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }

    if (province_id) {
      updateData.province_id = province_id;
    }

    const division = await Division.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found"
      });
    }

    res.status(200).json({
      success: true,
      data: division
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const deleteDivision = async (req, res) => {
  try {
    const division = await Division.findByIdAndDelete(req.params.id);

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    res.status(200).json({
      success: true,
      message: "Division  deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
