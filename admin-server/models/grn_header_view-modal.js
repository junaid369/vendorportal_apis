// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const grnHeaderViewSchema = new mongoose.Schema(
  {
    SITE: {
      //   type: ,
    },
    Site_Name: {
      //   type: ,
    },
    Po_No: {
      //   type: ,
    },
    Po_Date: {
      //   type: String,
    },
    Supp_No: {
      //   type: Number,
    },
    // glob_order: {
    //   //   type: Number,
    // },
    Addr_Chain: {
      //   type: Number,
    },

    CC: {
      //   type: Number,
    },
    Grn_No: {
      //   type: Number,
    },
    Grn_Dt: {
      //   type: Number,
    },
    Grn_User: {
      //   type: Number,
    },

    Int_Grn_no: {
      //   type: Number,
    },
    Integration_Dt: {
      //   type: Number,
    },
    Valuation_Dt: {
      //   type: Number,
    },
    CARRIER: {
      //   type: Number,
    },
    Trans_Grp: {
      //   type: Number,
    },
    Seal_No: {
      //   type: Number,
    },
    Dn_No: {
      //   type: Number,
    },
    Accquired_No: {
      //   type: Number,
    },

    OBSERVATIONS: {
      //   type: Number,
    },
    Comp_Name_Supp: {
      //   type: Number,
    },
    Street1_Supp: {
      //   type: Number,
    },
    Street2_Supp: {
      //   type: Number,
    },
    Postal_Code_Supp: {
      //   type: Number,
    },
    Villa_Supp: {
      //   type: Number,
    },
    District_Supp: {
      //   type: Number,
    },
    Region_Supp: {
      //   type: Number,
    },
    Country_Supp: {
      //   type: Number,
    },
    Vat_Code_Supp: {
      //   type: Number,
    },
    Comp_Name_Cust: {},
    Street1_Cust: {
      //   type: Number,
    },
    Street2_Cust: {
      //   type: Number,
    },

    Postal_Code_Cust: {
      //   type: Number,
    },
    Villa_cust: {
      //   type: Number,
    },
    District_Cust: {
      //   type: Number,
    },
    Region_Cust: {
      //   type: Number,
    },
    Country_Cust: {
      //   type: Number,
    },
    Vat_Code_Cust: {
      //   type: Number,
    },

    Customer_Number: {
      //   type: Number,
    },
    Currency_Code: {
      //   type: Number,
    },

    CURRENCY: {
      //   type: Number,
    },
    Exchange_Rate: {
      //   type: Number,
    },
    STATMENT1: {
      //   type: Number,
    },
    Pay_Type: {
      //   type: Number,
    },
    Subject_Vat: {
      //   type: Number,
    },
    Pay_Due_Date: {
      //   type: Number,
    },
    Dt_Cre: {
      //   type: Number,
    },
    Dt_Mod: {
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
  process.env.GRN_HEADER_VIEW,
  grnHeaderViewSchema
);
