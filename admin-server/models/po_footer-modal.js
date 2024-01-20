// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const poFooterViewSchema = new mongoose.Schema(
  {
    po_No: {
      //   type: ,
    },
    po_Int_Code: {
      //   type: Number,
    },
    glob_Int_Code: {
      //   type: String,
    },
    glob_order: {
      //   type: Number,
    },
    site_Code: {
      //   type: Number,
    },

    cnt_Articles: {
      //   type: Number,
    },
    cnt_Pu: {
      //   type: Number,
    },
    cnt_Sku: {
      //   type: Number,
    },

    tot_Gross: {
      //   type: Number,
    },

    tot_Linedisc: {
      //   type: Number,
    },
    excise_Tax: {
      //   type: Number,
    },
    footer_Disc: {
      //   type: Number,
    },
    net_Pval: {
      //   type: Number,
    },
    landed_Cost: {
      //   type: Number,
    },
    total_Vat: {
      //   type: Number,
    },
    total_Amt_W_Vat: {
      //   type: Number,
    },
  },
  {
    timestamps: true, // Add timestamps for createdAt and updatedAt fields
  }
);

// Export banner schema
module.exports = mongoose.model(process.env.PO_FOOTER_VIEW, poFooterViewSchema);
