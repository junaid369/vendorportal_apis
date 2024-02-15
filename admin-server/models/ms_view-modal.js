// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const msViewSchema = new mongoose.Schema(
  {
    DIV: {
      //   type: ,
    },
    DIVISION: {
      //   type: Number,
    },
    DEPT: {
      //   type: String,
    },
    DPEARTMENT: {
      //   type: Number,
    },
    SEC: {
      //   type: Number,
    },
    SECTION: {
      //   type: Number,
    },
    CAT: {
      //   type: Number,
    },
    CATEGORY: {
      //   type: Number,
    },
    SCAT: {
      //   type: Number,
    },

    SUB_CATEGORY: {
      //   type: Number,
    },
    SSCAT: {
      //SSCATtype: Number,
    },
    SUB_SUB_CATEGORY: {
      //   type: Number,
    },

    MERCHPATH: {
      //   type: Number,
    },

    MERCH_PATH: {
      //   type: Number,
    },
    ITEM_COUNT: {
      //   type: Number,
    },
  },
  {
    timestamps: {
      currentTime: () =>
        new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
    },
  }
);

// Export banner schema
module.exports = mongoose.model(
  process.env.MS_VIEW,
  msViewSchema
);
