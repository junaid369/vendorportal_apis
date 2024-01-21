// Import mongoose
const mongoose = require("mongoose");
// const { NUMBER } = require("oracledb");
require("dotenv").config();

// Create banner schema
const sitesViewSchema = new mongoose.Schema(
  {
    siteCode: {
      type: Number,
    },
    siteName: {
      type: String,
    },
    steCls: {
      type: Number,
    },
    siteClass: {
      type: String,
    },
    siteGroup: {
      type: String,
    },
    //   createdAt: {
    //     type: Date,
    //     immutable:true,
    //     default: () => Date.now(),
    //   },
    //   updatedAt: {
    //     type: Date,
    //     default: () => Date.now(),
    //   },
  },
  {
    timestamps: {
      currentTime: () =>
        new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
    },
  }
);

// Export banner schema
module.exports = mongoose.model(process.env.SPAR_SITES_VIEW, sitesViewSchema);
