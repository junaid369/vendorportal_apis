// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();
const moment = require("moment-timezone");

// Create banner schema
const stockQtyViewSchema = new mongoose.Schema(
  {
    Site_Group: {},
    STOSITE: {},
    Site_Name: {},
    Article_Code: {},
    Supp_No: {
      type: String,
    },
    BARCODE: {},
    Sales_Variant:{},
    Sv_Desc_Long_Eng: {},
    STOCKQTY: {},
    Stockqty_Block: {},
    Total: {},
    DIV: {},
    DIVISION: {},
    SEC: {},
    SECTION: {},
    BRAND: {},
    STOCKVALUE:{},
    StockValue_Block:{},
    Total_Value:{},
  },
  {
    timestamps: {
      currentTime: () =>
        new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
    },
  }
);

// Export banner schema
module.exports = mongoose.model(process.env.STOCK_QTY, stockQtyViewSchema);
