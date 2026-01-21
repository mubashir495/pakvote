import Tehsil from "../models/Tehsil.js";
import slugify from "slugify";

export const createTehsil = async (req, res) => {
  try {
    const { name, district_id } = req.body;

    const existingTehsil = await Tehsil.findOne({ name });
    if (existingTehsil) {
      return res.status(400).json({
        success: false,
        message: "Tehsil already exists",
      });
    }

    const tehsil = new Tehsil({
      name,
      slug: slugify(name, { lower: true }),
      district_id,
    });

    await tehsil.save();

    res.status(201).json({
      success: true,
      data: tehsil,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Tehsils
export const getAllTehsils = async (req, res) => {
  try {
    const tehsils = await Tehsil.find().populate("district_id", "name");

    res.status(201).json({
      success: true,
      count: tehsils.length,
      data: tehsils,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single Tehsil by ID
export const getTehsilById = async (req, res) => {
  try {
    const tehsil = await Tehsil.findById(req.params.id).populate(
      "district_id",
      "name"
    );

    if (!tehsil) {
      return res.status(404).json({
        success: false,
        message: "Tehsil not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tehsil,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Tehsil
export const updateTehsil = async (req, res) => {
  try {
    const { name, district_id } = req.body;

    const tehsil = await Tehsil.findById(req.params.id);
    if (!tehsil) {
      return res.status(404).json({
        success: false,
        message: "Tehsil not found",
      });
    }

    tehsil.name = name || tehsil.name;
    tehsil.slug = name ? slugify(name, { lower: true }) : tehsil.slug;
    tehsil.district_id = district_id || tehsil.district_id;

    await tehsil.save();

    res.status(200).json({
      success: true,
      data: tehsil,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Tehsil
export const deleteTehsil = async (req, res) => {
  try {
    const tehsil = await Tehsil.findById(req.params.id);
    if (!tehsil) {
      return res.status(404).json({
        success: false,
        message: "Tehsil not found",
      });
    }

    await tehsil.deleteOne();

    res.status(200).json({
      success: true,
      message: "Tehsil deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Tehsils by District (parent)
export const getTehsilsByDistrict = async (req, res) => {
  try {
 const { id } = req.params; 

    const tehsils = await Tehsil.find({ district_id: id })
      .populate("district_id", "name");  

    res.status(200).json({
      success: true,
      count: tehsils.length,
      data: tehsils,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
