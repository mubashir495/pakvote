import Province from "../models/Province.js";
import slugify from "slugify";

export const createProvince = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Province name is required" });
    }

    const exists = await Province.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Province already exists" });
    }

    const province = await Province.create({
      name,
      slug: slugify(name, { lower: true }),
    });

    res.status(201).json({
      success: true,
      data: province,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProvinces = async (req, res) => {
  try {
    const provinces = await Province.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: provinces.length,
      data: provinces,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProvinceById = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id);

    if (!province) {
      return res.status(404).json({ message: "Province not found" });
    }

    res.status(200).json({
      success: true,
      data: province,
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid Province ID" });
  }
};

export const updateProvince = async (req, res) => {
  try {
    const { name } = req.body;
    const province = await Province.findById(req.params.id);
    if (!province) {
      return res.status(404).json({ message: "Province not found" });
    }

    province.name = name || province.name;
    province.slug = name ? slugify(name, { lower: true }) : province.slug;

    await province.save();

    res.status(200).json({
      success: true,
      data: province,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProvince = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id);

    if (!province) {
      return res.status(404).json({ message: "Province not found" });
    }

    await province.deleteOne();

    res.status(200).json({
      success: true,
      message: "Province deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
