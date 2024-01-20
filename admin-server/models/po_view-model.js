// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const poHeaderViewSchema = new mongoose.Schema(
  {
    po_No: {
      //   type: ,
    },
    supp_Name: {
      //   type: String,
    },
    po_Int_Code: {
      //   type: Number,
    },
    glob_order: {
      //   type: Number,
    },
    site_Code: {
      //   type: Number,
    },

    ECDCFIN: {
      //   type: Number,
    },
    supp_No: {
      //   type: Number,
    },
    comm_Contract: {
      //   type: Number,
    },
    adress_chain_supp: {
      //   type: Number,
    },

    po_Comments: {
      //   type: Number,
    },
    po_Date: {
      //   type: Number,
    },
    delivery_Date: {
      //   type: Number,
    },
    delivery_Deadline: {
      //   type: Number,
    },
    free_Shipping: {
      //   type: Number,
    },
    address_Chain_Cust: {
      //   type: Number,
    },
    COMMENT1: {
      //   type: Number,
    },
    COMMENT2: {
      //   type: Number,
    },


    comp_Name_Supp: {
      //   type: Number,
    },
    street1_Supp: {
      //   type: Number,
    },
    street2_Supp: {
      //   type: Number,
    },
    postal_Code_Supp: {
      //   type: Number,
    },

    villa_Supp: {
      //   type: Number,
    },
    district_Supp: {
      //   type: Number,
    },
    region_Supp: {
      //   type: Number,
    },
    country_Supp: {
      //   type: Number,
    },
    vat_Code_Supp: {
      //   type: Number,
    },
    comp_Name_Cust:{

    },
    street1_Cust: {
      //   type: Number,
    },
    street2_Cust: {
      //   type: Number,
    },
 


    postal_Code_Cust: {
      //   type: Number,
    },
    villa_cust: {
      //   type: Number,
    },
    district_Cust: {
      //   type: Number,
    },
    region_Cust: {
      //   type: Number,
    },
    country_Cust: {
      //   type: Number,
    },
    vat_Code_Cust: {
      //   type: Number,
    },


    customer_Number: {
      //   type: Number,
    },
    po_Article_Sort: {
      //   type: Number,
    },
    po_Status: {
      //   type: Number,
    },
    exchange_Rate: {
      //   type: Number,
    },
    CURRENCY: {
      //   type: Number,
    },
  },
  {
    timestamps: true, // Add timestamps for createdAt and updatedAt fields
  }
);

// Export banner schema
module.exports = mongoose.model(process.env.PO_HEADER_VIEW, poHeaderViewSchema);
