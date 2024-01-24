// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();
const moment = require("moment-timezone");

// Create banner schema
const suppHeaderViewSchema = new mongoose.Schema(
  {
    VENDOR: {
      //   type: ,
    },
    FOUCFIN: {
      //   type: String,
    },
    Vendor_Name: {
      //   type: Number,
    },
    STAT: {
      //   type: Number,
    },
    STATUS: {
      //   type: Number,
    },

    Supplier_Type: {
      //   type: Number,
    },
    Supplier_Category: {
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

// // // Pre-save middleware to customize createdAt and updatedAt
// suppHeaderViewSchema.pre("save", function (next) {
//   // Set createdAt and updatedAt to the current time in the Saudi Arabia time zone
//   const now = moment().tz("Asia/Riyadh").toDate();
//   this.createdAt = now;
//   this.updatedAt = now;
//   next();
// });

// Export banner schema
module.exports = mongoose.model(process.env.SUPP_VIEW, suppHeaderViewSchema);
