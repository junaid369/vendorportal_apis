// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();
const moment = require("moment-timezone");

// Create banner schema
const slaViewSchema = new mongoose.Schema(
  {
    Location_Id: {},
    Po_Date: {},
    Selection_Date_Po: {},
    Grn_Date: {},
    Selection_Date_Grn: {},
    ECDDLIM: {},
    Order_Type: {},
    Order_Type_Desc: {},
    Po_No: {},
    Int_Grn_No: {},
    Ext_Grn_No: {},
    Delv_Note_No: {},
    ARTUSTK: {},
    Vat_Code: {},
    Po_Status: {},
    Po_Line_Status: {},
    Supp_No: {},
    Supplier_Name: {},
    Cc_No: {},
    DEPTCODE: {},
    DEPTDESC: {},
    SECTCODE: {},
    SECTDESC: {},
    Product_Code: {},
    LV: {},
    Lu_Description: {},
    Order_Unit: {},
    Pck_Size: {},
    Order_Sku: {},
    Order_Sku_Pck: {},
    Po_Net_Value: {},
    Rec_Qte: {},
    Rec_Qte_Pck: {},
    Rec_Value: {},
    Diff_Qty: {},
    Diff_Qty_Pck: {},
    Diff_Value: {},
    Qty_Serv_Lvl: {},
    Val_Serv_Lvl: {},
    CINR: {},
    CINL: {},
    SEQVL: {},
    BRAND: {},
    MONTH: {
      // type: Date,
    },
    YEAR: {
      // type: Date,
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
module.exports = mongoose.model(process.env.SLA_VIEW, slaViewSchema);
