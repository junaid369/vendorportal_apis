// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const itemMasterViewSchema = new mongoose.Schema(
  {
    ARTCINR: {
      //   type: ,
    },
    Article_Code: {
      //   type: Number,
    },
    Article_Descr_En: {
      //   type: String,
    },
    Article_Descr_Ar: {
      //   type: Number,
    },
    Sales_Variant: {
      //   type: Number,
    },
    Sv_Descr_Long_En: {
      //   type: Number,
    },
    Sv_Descr_Long_Ar: {
      //   type: Number,
    },
    BARCODE: {
      //   type: Number,
    },
    ARTTYPP: {
      //   type: Number,
    },

    ARTTYPE: {
      //   type: Number,
    },
    ARTUSTK: {
      //   type: Number,
    },
    Stock_Unit: {
      //   type: Number,
    },

    ARTETAT: {
      //   type: Number,
    },

    STATUS: {
      //   type: Number,
    },
    CONSIGNMENT: {
      //   type: Number,
    },
    DIV: {
      //   type: Number,
    },
    DIVISION: {
      //   type: Number,
    },
    DEPT: {
      //   type: Number,
    },
    DEPARTMENT: {
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
      //   type: Number,
    },
    SUB_SUB_SCABTEGORY: {
      //   type: Number,
    },
    BRAND: {
      //   type: Number,
    },

    Kvl_Flag: {
      //   type: Number,
    },
    Main_Supplier: {
      //   type: Number,
    },
    ARVETAT: {
      //   type: Number,
    },
    Sv_Status: {
      //   type: Number,
    },
    Main_Sv: {
      //   type: Number,
    },
    PACK: {
      //   type: Number,
    },
    ARVCVX: {
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
  process.env.ITEM_MASTER_VIEW,
  itemMasterViewSchema
);
