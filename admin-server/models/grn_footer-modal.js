// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const grnFooterViewSchema = new mongoose.Schema(
  {
    Po_No: {
      //   type: ,
    },
    Po_Int_Code: {
      //   type: Number,
    },
    Glob_Int_Code: {
      //   type: String,
    },
    Glob_order: {
      //   type: Number,
    },
    Site_Code: {
      //   type: Number,
    },
    Int_Grn_No: {
      //   type: Number,
    },
    Grn_No: {
      //   type: Number,
    },
    Dn_No: {
      //   type: Number,
    },
    Grn_Dt: {
      //   type: Number,
    },

    Cnt_Articles: {
      //   type: Number,
    },
    Cnt_Pu: {
      //   type: Number,
    },
    Cnt_Sku: {
      //   type: Number,
    },

    Tot_Gross: {
      //   type: Number,
    },

    Tot_Linedisc: {
      //   type: Number,
    },
    Excise_Tax: {
      //   type: Number,
    },
    Footer_Disc: {
      //   type: Number,
    },
    Net_Pval: {
      //   type: Number,
    },
    Landed_Cost: {
      //   type: Number,
    },
    Total_Vat: {
      //   type: Number,
    },
    Total_Amt_W_Vat: {
      //   type: Number,
    },
    Total_Sales_Aft_Tax: {
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
module.exports = mongoose.model(process.env.GRN_FOOTER_VIEW, grnFooterViewSchema);
