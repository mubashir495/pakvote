import Division from "../models/Division.js";
import Province from "../models/Province.js";
import slugify from "slugify";

/* ================= CREATE ================= */
export const createDivision = async (req, res) => {
  try {
    const { name, province_id } = req.body;

    if (!name || !province_id) {
      return res.status(400).json({
        success: false,
        message: "Division name and province are required",
      });
    }

    const provinceExists = await Province.findById(province_id);
    if (!provinceExists) {
      return res.status(404).json({
        success: false,
        message: "Province not found",
      });
    }

    const slug = slugify(name, { lower: true });

    const exists = await Division.findOne({
      $or: [{ name }, { slug }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Division already exists",
      });
    }

    const division = await Division.create({
      name,
      slug,
      province_id,
    });

    res.status(201).json({
      success: true,
      data: division,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ALL ================= */
export const getAllDivision = async (req, res) => {
  try {
    const divisions = await Division.find()
      .populate("province_id", "name slug")
      .sort({ createdAt: -1 });

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

/* ================= GET BY ID ================= */
export const getDivisionById = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id).populate(
      "province_id",
      "name slug"
    );

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    res.status(200).json({
      success: true,
      data: division,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Division ID",
    });
  }
};

/* ================= GET BY PROVINCE ================= */
export const getDivisionByProvince = async (req, res) => {
  try {
    const { id } = req.params;

    const provinceExists = await Province.findById(id);
    if (!provinceExists) {
      return res.status(404).json({
        success: false,
        message: "Province not found",
      });
    }

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

/* ================= UPDATE ================= */
export const updateDivision = async (req, res) => {
  try {
    const { name, province_id } = req.body;
    const updateData = {};

    if (name) {
      const slug = slugify(name, { lower: true });

      const exists = await Division.findOne({
        $or: [{ name }, { slug }],
        _id: { $ne: req.params.id },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Division already exists",
        });
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (province_id) {
      const provinceExists = await Province.findById(province_id);
      if (!provinceExists) {
        return res.status(404).json({
          success: false,
          message: "Province not found",
        });
      }
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
        message: "Division not found",
      });
    }

    res.status(200).json({
      success: true,
      data: division,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE ================= */
export const deleteDivision = async (req, res) => {
  try {
    const division = await Division.findByIdAndDelete(req.params.id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: "Division not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Division deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
