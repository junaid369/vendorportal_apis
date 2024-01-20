// Import mongoose
const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;
require("dotenv").config();

// Create banner schema
const adminModuleSchema = new mongoose.Schema(
  {
    fkModuleId: {
      type: Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      immutable: true,
      // ref: process.env.ADMIN_COLLECTION,
    },
    title: {
      type: String,
      required: [true, "Title is required"], // title field is required
    },
    icon: {
      type: String,
      required: [true, "icon is required"], // title field is required
    },
    sortNo: {
      type: Number,
    },
    strActiveStatus: {
      type: Boolean,
      required: [true, "modulestatus is required"], // title field is required
    },
    strStatus: {
      type: String,
      default: "N",
    },
    arrSubModule: [
      {
        _id: {
          type: String,
        },
        path: {
          type: String,
        },
        title: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true, // Add timestamps for createdAt and updatedAt fields
  }
);

//admin scehma

// Define module structure / schema
const adminModules = new mongoose.Schema(
  {
    fkModuleId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Module details is required"],
    },
    subModules: {
      type: [mongoose.Types.ObjectId],
      required: [true, "At least one sub module is required"],
    },
  },

  { _id: false }
);

// Define the admin schema using mongoose.Schema
const adminSchema = new mongoose.Schema(
  {
    fkAdminId: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      // immutable: true,
    },
    strEmail: {
      type: String,
      required: [true, "Email is required"], // Email field is required
      unique: true,
      validate: {
        // Validate that the email is in a valid format
        validator: (value) => validator.isEmail(value),
        message: "Invalid email", // Error message if the email is invalid
      },
      createIndexes: { unique: true }, // Create unique index for email field
    },
    strName: {
      type: String,
      required: [true, "Name is required"], // Name field is required
    },
    strPassword: {
      type: String,
      required: [true, "Password is required"], // Password field is required
      select: false,
    },
    strUserLevel: {
      type: Number,
      required: [true, "User Level is required"], // Required filed
    },
    strUserType: {
      type: String,
      required: [true, "User Type is required"], // Required filed
    },

    strStatus: {
      type: String,
      default: "P", // It will be either N or D or p. It will be changed to D when deleting it.
      required: [true, "status not provided"], // It is required field, checking user deleted or not.
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
    },
    arryModuleDetails: {
      ref: process.env.ADMIN_COLLECTION,
      validate: {
        validator: function (value) {
          // Custom validation logic based on user level
          if (this.strStatus == "N" && !value) {
            // module details is  required for this user status
            return true;
          }
          if (this.strStatus !== "N" && !value) {
            // module details is not  required for this user status

            return false;
          }
          return true;
        },
        message: "Module details its need when your admin approval completion",
      },
      type: [adminModules],
      // type: [
      //   {
      //     fkModuleId: {
      //       type: mongoose.Types.ObjectId,
      //       required: [true, "Module details is required"],
      //     },
      //     subModules: {
      //       type: [mongoose.Types.ObjectId],
      //       required: [true, "At least one sub module is required"],
      //     },
      //   },
      // ],
    },
    country: {
      type: String,
      required: false,
    },

    reportUserName: {
      type: String,
    },

    reportUserId: {
      type: mongoose.Types.ObjectId,
      ref: process.env.ADMIN_COLLECTION,
      validate: {
        validator: function (value) {
          // Custom validation logic based on user level
          if (this.strUserLevel == 1) {
            // SuperiorId is not required for user level 1
            return false;
          } else {
            return true;
          }
        },
        message:
          "SuperiorId is not required for user level 1, and required for other user levels.",
      },
    },
  },
  {
    timestamps: true, // Add timestamps for createdAt and updatedAt fields
  }
);

//logindetails schema
const adminLoginSchema = new mongoose.Schema(
  {
    fkAdminId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Module details is required"],
    },
    data: {
      type: String,
    },
    strStatus: {
      type: String,
    },
  },
  {
    timestamps: true, // Add timestamps for createdAt and updatedAt fields
  }
);

//login schmea
const Login = mongoose.model(process.env.ADMIN_LOGIN_COLLECTION, adminLoginSchema);

// Admin Model
const Admin = mongoose.model(process.env.ADMIN_COLLECTION, adminSchema);

// Module Model
const Module = mongoose.model(process.env.ADMIN_MODULES_COLLECTION, adminModuleSchema);
module.exports = { Admin, Module, Login };
