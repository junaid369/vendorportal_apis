// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const poDetailViewSchema = new mongoose.Schema(
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

    prod_Code: {
      //   type: Number,
    },
    supp_Ref_Code: {
      //   type: Number,
    },
    BARCODE: {
      //   type: Number,
    },

    product_Desc: {
      //   type: Number,
    },

    ou_Type: {
      //   type: Number,
    },
    LV: {
      //   type: Number,
    },
    sku_Ou: {
      //   type: Number,
    },
    weight_Ou: {
      //   type: Number,
    },
    qty_Ordered_Ou: {
      //   type: Number,
    },
    free_Qty: {
      //   type: Number,
    },
    GROSSPRICE: {
      //   type: Number,
    },
    DISCPERC: {
      //   type: Number,
    },

    DISCVALUE: {
      //   type: Number,
    },
    excise_Tax: {
      //   type: Number,
    },
    NETPRICE: {
      //   type: Number,
    },
    vat_Perc: {
      //   type: Number,
    },

    pp_Unit: {
      //   type: Number,
    },
    NETPVALUE: {
      //   type: Number,
    },
    CINR: {
      //   type: Number,
    },
    CINL: {
      //   type: Number,
    },
    SEQVL: {
      //   type: Number,
    },
    po_LineNo: {},
 
    qty_Ordered_Pcs: {
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
module.exports = mongoose.model(process.env.PO_DETAIL_VIEW, poDetailViewSchema);
