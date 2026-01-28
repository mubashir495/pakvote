import Constituency from "../models/Constituency.js";
import slugify from "slugify";

// Create a new Constituancy
export const createConstituency = async (req, res) => {
  try {
    const { name, tehsil_id } = req.body;
    const existing = await Constituency.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Constituancy already exists",
      });
    }

const constituancy = new Constituency({
      name,
      slug: slugify(name, { lower: true }),
      tehsil_id,
    });

    await constituancy.save();

    res.status(201).json({
      success: true,
      message:"Constituency successfully added",
      data: constituancy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Constituancies
export const getAllConstituencies = async (req, res) => {
  try {
    const constituancies = await Constituency.find()
      .populate({
        path: "tehsil_id",
        populate: {
          path: "district_id",
          populate: {
            path: "division_id",
            populate: {
              path: "province_id"
            }
          }
        }
      });

    res.status(200).json({
      success: true,
      count: constituancies.length,
      data: constituancies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single Constituancy by ID
export const getConstituencyById = async (req, res) => {
  try {
    const constituancy = await Constituency.findById(req.params.id)
      .populate({
        path: "tehsil_id",
        populate: {
          path: "district_id",
          populate: {
            path: "division_id",
            populate: {
              path: "province_id"
            }
          }
        }
      });

    if (!constituancy) {
      return res.status(404).json({
        success: false,
        message: "Constituancy not found",
      });
    }

    res.status(200).json({
      success: true,
      data: constituancy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Constituancy
export const updateConstituency = async (req, res) => {
  try {
    const { name, tehsil_id } = req.body;

    const constituancy = await Constituency.findById(req.params.id);
    if (!constituancy) {
      return res.status(404).json({
        success: false,
        message: "Constituancy not found",
      });
    }

    constituancy.name = name || constituancy.name;
    constituancy.slug = name ? slugify(name, { lower: true }) : constituancy.slug;
    constituancy.tehsil_id = tehsil_id || constituancy.tehsil_id;

    await constituancy.save();

    res.status(200).json({
      success: true,
      data: constituancy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Constituancy
export const deleteConstituency = async (req, res) => {
  try {
    const constituancy = await Constituency.findById(req.params.id);
    if (!constituancy) {
      return res.status(404).json({
        success: false,
        message: "Constituancy not found",
      });
    }

    await constituancy.deleteOne();

    res.status(200).json({
      success: true,
      message: "Constituancy deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Constituancies by Tehsil (parent)
export const getConstituenciesByTehsil = async (req, res) => {
  try {
    const { tehsilId } = req.params;

    const constituancies = await Constituency.find({ tehsil_id: tehsilId });

    res.status(200).json({
      success: true,
      count: constituancies.length,
      data: constituancies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
