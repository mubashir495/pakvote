import Province from "../models/Province.js";
import mongoose from "mongoose";

export const getProvinceHierarchy = async (req, res) => {
  try {
    const { provinceId } = req.params;

    const data = await Province.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(provinceId)
        }
      },

      {
        $lookup: {
          from: "divisions",
          localField: "_id",
          foreignField: "province_id",
          as: "divisions"
        }
      },

      { $unwind: { path: "$divisions", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "districts",
          localField: "divisions._id",
          foreignField: "division_id",
          as: "divisions.districts"
        }
      },

      { $unwind: { path: "$divisions.districts", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "tehsils",
          localField: "divisions.districts._id",
          foreignField: "district_id",
          as: "divisions.districts.tehsils"
        }
      },

      { $unwind: { path: "$divisions.districts.tehsils", preserveNullAndEmptyArrays: true } },

      // NA Constituencies
      {
        $lookup: {
          from: "constituencynas",
          localField: "divisions.districts.tehsils._id",
          foreignField: "tehsil_id",
          as: "divisions.districts.tehsils.na_constituencies"
        }
      },

      // PP Constituencies
      {
        $lookup: {
          from: "constituencypps",
          localField: "divisions.districts.tehsils._id",
          foreignField: "tehsil_id",
          as: "divisions.districts.tehsils.pp_constituencies"
        }
      },

      {
        $group: {
          _id: {
            provinceId: "$_id",
            divisionId: "$divisions._id",
            districtId: "$divisions.districts._id",
            tehsilId: "$divisions.districts.tehsils._id"
          },

          provinceName: { $first: "$name" },
          divisionName: { $first: "$divisions.name" },
          districtName: { $first: "$divisions.districts.name" },
          tehsilName: { $first: "$divisions.districts.tehsils.name" },

          na_constituencies: {
            $first: "$divisions.districts.tehsils.na_constituencies"
          },

          pp_constituencies: {
            $first: "$divisions.districts.tehsils.pp_constituencies"
          }
        }
      }

    ]);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};