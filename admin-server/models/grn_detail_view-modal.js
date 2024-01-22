// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const grnDetailViewSchema = new mongoose.Schema(
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
    Int_Grn_No: {
      //   type: Number,
    },
    Site_Code: {
      //   type: Number,
    },

    Prod_Code: {
      //   type: Number,
    },

    BARCODE: {
      //   type: Number,
    },
    Supp_Ref_Code: {
      //   type: Number,
    },
    LV: {
      //   type: Number,
    },
    LU: {
      //   type: Number,
    },

    Product_Desc: {
      //   type: Number,
    },
    Orig_Country: {
      //   type: Number,
    },
    LINENO: {
      //   type: Number,
    },
    Order_Qty_Pcs: {
      //   type: Number,
    },
    Free_Qty: {
      //   type: Number,
    },
    Back_Order_Qty: {
      //   type: Number,
    },
    Refused_Qty: {
      //   type: Number,
    },
    // Received_Qty: {
    //   //   type: Number,
    // },
    Received_Qty_Pcs: {
      //   type: Number,
    },
    Qty_Unit: {
      //   type: Number,
    },
    Gross_Pp: {
      //   type: Number,
    },

    DISCPERC: {
      //   type: Number,
    },

    DISCVALUE: {
      //   type: Number,
    },

    Net_Pp: {
      //   type: Number,
    },

    Pp_Unit: {
      //   type: Number,
    },
    VAT: {
      //   type: Number,
    },
    Line_Total: {
      //   type: Number,
    },
    Line_Total_Sales: {
      //   type: Number,
    },
    MARGPERC: {
      //   type: Number,
    },
    Vat_Value: {
      //   type: Number,
    },
    Recived_Weight: {
      //   type: Number,
    },
    Free_Weight: {
      //   type: Number,
    },
    Refused_Weight: {
      //   type: Number,
    },
    ARTUSTK: {
      //   type: Number,
    },
    Received_Packs: {
      //   type: Number,
    },
    Spl_Oper: {
      //   type: Number,
    },
    Sales_Price: {
      //   type: Number,
    },
    Grn_No: {
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
  process.env.GRN_DETAIL_VIEW,
  grnDetailViewSchema
);
