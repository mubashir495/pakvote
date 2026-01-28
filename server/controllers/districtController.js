import District from "../models/District.js";
import slugify from "slugify";


export const createDistrict = async (req, res) => {
  try {
    const { name, division_id } = req.body;

    if (!name || !division_id) {
      return res.status(400).json({ message: "Name and Division are required" });
    }

    const slug = slugify(name, { lower: true });

    const exists = await District.findOne({
      $or: [{ name }, { slug }]
    });

    if (exists) {
      return res.status(409).json({ message: "District already exists" });
    }

    const district = await District.create({
      name,
      slug,
      division_id
    });

    res.status(201).json({
      success: true,
      data: district
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find()
      .populate({
        path: "division_id",
        select: "name slug",
        populate: {
          path: "province_id",
          select: "name slug",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id)
      .populate("division_id", "name slug");

    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    res.status(200).json({
      success: true,
      data: district
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid District ID" });
  }
};

export const getDistrictsByDivision = async (req, res) => {
  try {
    const districts = await District.find({
      division_id: req.params.id
    });

    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDistrict = async (req, res) => {
  try {
    const { name, division_id } = req.body;

    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }

    if (division_id) {
      updateData.division_id = division_id;
    }

    const district = await District.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!district) {
      return res.status(404).json({
        success: false,
        message: "District not found"
      });
    }

    res.status(200).json({
      success: true,
      data: district
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteDistrict = async (req, res) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    res.status(200).json({
      success: true,
      message: "District deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
