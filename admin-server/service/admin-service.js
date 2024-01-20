// funAddAdminModules

// const config = require("../config/config");
const common = require("../global/common");
const mongoose = require("mongoose");
const { Admin, Module, Login } = require("../models/admin-model");
let jwt = require("jsonwebtoken");
const config = require("../config/config");
const { create } = require("../models/sites_view-model");
const arrayEmpty = [];

module.exports = {
  //Add admin modules
  funAddAdminModules: async function (obj, db) {
    try {
      let araySub = [];

      let module = {
        fkModuleId: new mongoose.Types.ObjectId(),
        title: obj?.title,
        icon: obj?.icon,
        sortNo: obj?.sortNo,
        arrSubModule: obj?.arrSubModule,
        strActiveStatus: obj?.strActiveStatus,
        strStatus: "N",
      };

      module.arrSubModule
        ? module.arrSubModule.forEach((element) => {
            element._id = new mongoose.Types.ObjectId().toString();
            araySub.push(element);
          })
        : null;

      let updateUserModuels = await Module.create(module);

      if (updateUserModuels) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed to update.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funUpdateAdminModules: async function (obj, db) {
    try {
      let araySub = [];
      let fkModuleId = obj.fkModuleId;
      if (!fkModuleId)
        return {
          success: false,
          message: "ModuleId Missing.",
          data: arrayEmpty,
        };

      let module = {
        title: obj?.title,
        icon: obj?.icon,
        sortNo: obj?.sortNo,
        arrSubModule: obj?.arrSubModule,
        strActiveStatus: obj?.strActiveStatus,
        strStatus: "N",
      };

      module.arrSubModule
        ? module.arrSubModule.forEach((element) => {
            element._id = new mongoose.Types.ObjectId().toString();
            araySub.push(element);
          })
        : null;

      let updateUserModuels = await Module.updateOne(
        { fkModuleId: new mongoose.Types.ObjectId(fkModuleId) },
        { $set: module }
      );

      if (updateUserModuels.modifiedCount == 1) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed to update.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  //delete modules
  funDeleteAdminModules: async function (obj, db) {
    try {
      let fkModuleId = obj.fkModuleId;
      let strLoginUserId = obj.strLoginUserId;

      if (!fkModuleId)
        return {
          success: false,
          message: "ModuleId Missing.",
          data: arrayEmpty,
        };

      let moduleMatch = {
        fkModuleId: new mongoose.Types.ObjectId(fkModuleId),
      };

      let updateUserModuels = await Module.updateOne(moduleMatch, {
        $set: { strStatus: "D" },
      });
      console.log(updateUserModuels);

      if (updateUserModuels) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed to update.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  //get admin modules
  funGetAdminModules: async function (obj, db) {
    try {
      let fkModuleId = obj.fkModuleId;
      let strActiveStatus = obj.strActiveStatus;

      let query1 = { strStatus: "N" };
      let query2 = {};
      let query3 = {};
      if (fkModuleId) {
        query2 = {
          fkModuleId: new mongoose.Types.ObjectId(fkModuleId),
        };
      }
      if (strActiveStatus) {
        query3 = {
          strActiveStatus: strActiveStatus,
        };
      }
      let match = { $and: [query1, query2, query3] };
      let getUserModules = await Module.find(match);

      if (getUserModules && getUserModules.length) {
        return {
          success: true,
          message: "Success.",
          data: getUserModules,
        };
      } else {
        return {
          success: false,
          message: "No modules found.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  //get adminlogin
  funGetAdminLogin: async function (obj, db) {
    try {
      let strEmail = obj.strEmail;
      let strPassword = obj.strPassword;

      let adminDetails = await Admin.aggregate([
        {
          $match: {
            strEmail: strEmail,
            strStatus: "N",
          },
        },
        {
          $project: {
            fkAdminId: 1,
            strPassword: 1,
            strUserLevel: 1,
            arrModuleDetails: 1,
            strUserType: 1,
            _id: 0,
          },
        },
      ]);

      if (!adminDetails.length > 0)
        return {
          success: false,
          message: "does not matching any documents",
          data: arrayEmpty,
        };
      let objLoginPassword = common.validPassword(strPassword);

      if (adminDetails[0].strPassword != objLoginPassword)
        return {
          success: false,
          message: "Does not match the password.",
          data: [],
        };
      let objPasData = {
        strEmail: obj.strEmail,
        intUserId: adminDetails[0].fkAdminId,
      };
      if (adminDetails[0].strUserType == "SUPER-ADMIN") {
        let moduleDetails = await Module.find({ strStatus: "N" });
        adminDetails[0].arryModuleDetails = moduleDetails;
      } else {
        let moduleDetails = await Admin.aggregate([
          {
            $match: {
              fkAdminId: new mongoose.Types.ObjectId(adminDetails[0].fkAdminId),
            },
          },
          {
            $lookup: {
              from: "cln_admin_modules_spars",
              localField: "arryModuleDetails.fkModuleId",
              foreignField: "fkModuleId",
              as: "moduleDetails",
            },
          },
          {
            $project: {
              "moduleDetails._id": 0,
              "moduleDetails.createdAt": 0,
              "moduleDetails.updatedAt": 0,
              "moduleDetails.__v": 0,
            },
          },
        ]);

        if (moduleDetails) {
          console.log(moduleDetails, "module details");
          let adminIds = [];
          if (moduleDetails && moduleDetails.length > 0) {
            moduleDetails[0].arryModuleDetails.forEach(async (element) => {
              element.subModules.forEach((element) => {
                adminIds.push(element.toString());
              });
            });
          }

          //filter that id's with admin modules deatils array
          let validmoduels = [];
          moduleDetails[0].moduleDetails.forEach((element, index) => {
            element.arrSubModule.forEach((object) => {
              if (adminIds.includes(object._id.toString())) {
                validmoduels.push(object);
              } else {
              }
            });
            moduleDetails[0].moduleDetails[index].arrSubModule = validmoduels;
            validmoduels = [];
            index++;
          });
          adminDetails[0].arryModuleDetails = moduleDetails[0].moduleDetails;
        }
      }

      const token = jwt.sign({ user: objPasData }, config.JWT_SECRET, {
        expiresIn: "10m",
      }); // 10 minutes expiration

      if (token) {
        adminDetails[0].token = token;
        let insertToken = {
          fkAdminId: new mongoose.Types.ObjectId(adminDetails[0].fkAdminId),
          data: token,
          strStatus: "LOGIN",
          dateCreated: new Date(),
          dateUpdated: null,
        };
        let insertLoginDetails = await Login.create(insertToken);
        if (insertLoginDetails) {
          return {
            success: true,
            message: "Login success",
            data: adminDetails[0],
          };
        } else {
          return {
            success: true,
            message: "Login falied",
            data: arrayEmpty,
          };
        }
      } else {
        return {
          success: false,
          message: "Token implment failed",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  // funAdminLoginrequst
  funAdminLoginrequst: async function (obj, db) {
    try {
      let araySub = [];

      let adminDetails = {
        fkModuleId: new mongoose.Types.ObjectId(),
        strEmail: obj?.strEmail,
        strName: obj?.strName,
        strPassword: obj?.strPassword,
        strUserLevel: obj?.strUserLevel,
        strUserType: obj?.strUserType,
        phone: obj?.phone,
        arryModuleDetails: obj?.arryModuleDetails || [],
        country: obj?.country,
      };
      let hashpassword = common.setPassword(adminDetails.strPassword);
      if (!hashpassword)
        return {
          success: false,
          message: "Password encryption failed.",
          data: arrayEmpty,
        };
      adminDetails.strPassword = hashpassword;
      if (adminDetails.strUserLevel > 1) {
        if (!obj.reportUserId && !obj.reportUserName)
          return {
            success: false,
            message: "Reporting userid missing.",
            data: arrayEmpty,
          };
        adminDetails.reportUserName = obj?.reportUserName;
        adminDetails.reportUserId =
          new mongoose.Types.ObjectId(obj?.reportUserId) || "";
      }

      let updateUserModuels = await Admin.create(adminDetails);

      if (updateUserModuels) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed to update.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  // funAdminApprove

  funAdminApprove: async function (obj, db) {
    try {
      let fkAdminId = obj.fkAdminId;
      if (!fkAdminId) {
        return {
          success: false,
          message: "AdminId missing.",
          data: arrayEmpty,
        };
      }

      let adminDetails = {
        strUserLevel: obj?.strUserLevel,
        arryModuleDetails: obj?.arryModuleDetails,
        strStatus: obj?.strStatus,
      };

      if (adminDetails.strUserLevel > 1) {
        if (!obj.reportUserId && !obj.reportUserName)
          return {
            success: false,
            message: "Reporting userid missing.",
            data: arrayEmpty,
          };
        adminDetails.reportUserName = obj?.reportUserName;
        adminDetails.reportUserId = new mongoose.Types.ObjectId(
          obj?.reportUserId
        );
      }

      let updateUserModuels = await Admin.updateOne(
        { fkAdminId: new mongoose.Types.ObjectId(fkAdminId) },
        { $set: adminDetails }
      );

      if (updateUserModuels.modifiedCount == 1) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed to update.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  //TO DO : this function provide login requst list group wise admin usert type
  funLoginrequstView: async function (obj, db) {
    try {
      let strLoginUserId = obj.strLoginUserId;
      let typeMatch;

      if (!strLoginUserId) {
        return {
          success: false,
          message: "Admin  id missing.",
          data: arrayEmpty,
        };
      }

      let getAdmin = await Admin.find({
        fkAdminId: new mongoose.Types.ObjectId(strLoginUserId),
      });
      if (!getAdmin.length)
        return {
          success: false,
          message: "not matching any admin documents.",
          data: arrayEmpty,
        };

      if (getAdmin[0].strUserType == "SUPER-ADMIN") {
        typeMatch = {
          strUserLevel: 1,
          strStatus: "P",
        };
      } else {
        typeMatch = {
          // strUserLevel: { $gt: 1 },
          strStatus: "P",
          reportUserId: new mongoose.Types.ObjectId(strLoginUserId),
        };
      }

      let updateUserModuels = await Admin.find(typeMatch).select({
        _id: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      });

      if (updateUserModuels.length) {
        return {
          success: true,
          message: "Success.",
          data: updateUserModuels,
        };
      } else {
        return {
          success: false,
          message: "not matching.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  //TO DO : this function provide get all admins view
  funGetAllAdmins: async function (obj, db) {
    try {
      let strLoginUserId = obj.strLoginUserId;

      if (!strLoginUserId) {
        return {
          success: false,
          message: "Admin  id missing.",
          data: arrayEmpty,
        };
      }

      let getAdmin = await Admin.find({
        fkAdminId: new mongoose.Types.ObjectId(strLoginUserId),
      });
      if (!getAdmin.length)
        return {
          success: false,
          message: "not matching the adminid documents.",
          data: arrayEmpty,
        };

      let getAllAdmins = await Admin.find({ strStatus: "N" }).select({
        _id: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      });

      if (getAllAdmins.length) {
        return {
          success: true,
          message: "Success.",
          data: getAllAdmins,
          count: getAllAdmins.length,
        };
      } else {
        return {
          success: false,
          message: "not matching.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },

  //funLoginrequstView
  //get admin types
  fungetAdminUserType: async function (db) {
    try {
      let getUserType = await db
        .collection(config.ADMIN_USERTYPE_COLLECTION)
        .find({ strStatus: "N" })
        .toArray();
      if (getUserType && getUserType.length) {
        return {
          success: true,
          message: "Success.",
          data: getUserType,
        };
      } else {
        return {
          success: false,
          message: "No usertypes found.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funValidatee: async function (obj, db) {
    try {
      let strLoginUserId = obj.strLoginUserId;
      let strUserName = obj.strUserName;
      let strEmail = obj.strEmail;
      let strPassword = obj.strPassword;
      let strUsertype = obj.strUsertype;
      let stAdminUsertype = obj.stAdminUsertype;
      // let arryModuleDetails = obj.arryModuleDetails;

      if (strLoginUserId) {
        if (strUserName) {
          if (strEmail) {
            if (strPassword) {
              if (strUsertype) {
                if (
                  stAdminUsertype == "ADMIN" ||
                  stAdminUsertype == "SUPER-ADMIN"
                ) {
                  let findEmail = { strEmail: strEmail, strStatus: "N" };

                  let userEmail = await db
                    .collection(config.ADMIN_COLLECTION)
                    .find(findEmail)
                    .count();
                  if (userEmail == 0) {
                    return {
                      success: true,
                      message: "Success.",
                      data: arrayEmpty,
                    };
                  } else {
                    return {
                      success: false,
                      message: "There is a user with this E-mail already.",
                      data: arrayEmpty,
                    };
                  }
                } else {
                  return {
                    success: false,
                    message: "Only admin can create user.",
                    data: arrayEmpty,
                  };
                }
              } else {
                return {
                  success: false,
                  message: "Please select a user type.",
                  data: arrayEmpty,
                };
              }
            } else {
              return {
                success: false,
                message: "Please enter a password.",
                data: arrayEmpty,
              };
            }
          }
        } else {
          return {
            success: false,
            message: "Please enter Username.",
            data: arrayEmpty,
          };
        }
      } else {
        return {
          success: false,
          message: "Please login to continue.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funAddAdminUser: async function (obj, db) {
    try {
      let strLoginUserId = obj.strLoginUserId;
      let strUserName = obj.strUserName;
      let strEmail = obj.strEmail;
      let strPassword = obj.strPassword;
      let strUserTypeId = obj.strUserTypeId;
      let strUsertype = obj.strUsertype;
      let arryModuleDetails = obj.arryModuleDetails;
      // let objShop = obj.objShop;

      // let passObj = common.setPassword();

      let array = [];
      if (arryModuleDetails.length > 0) {
        arryModuleDetails.forEach((element) => {
          element.fkModuleId = ObjectID(element.fkModuleId);

          array.push(element);
        });
      }

      // if (strUsertype == "SUPER_ADMIN") {
      //   array = [];
      // }
      let insertData = {
        fkAdminId: ObjectID(),
        strUserName: strUserName,
        strEmail: strEmail,
        strPassword: strPassword,
        fkUserTypeId: ObjectID(strUserTypeId),
        strUserType: strUsertype,
        arryModuleDetails: array,
        // objShopDetails: objShop || {},
        strStatus: "N",
        strCreateUserId: ObjectID(strLoginUserId),
        dateCreateDateAndTime: config.time(),
        strUpdateUserId: null,
        dateUpdateDateAndTime: null,
      };

      let insertAdmin = await db
        .collection(config.ADMIN_COLLECTION)
        .insertOne(insertData);
      if (insertAdmin && insertAdmin.result["ok"] == 1) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funUpdateAdmin: async function (obj, db) {
    try {
      let strLoginUserId = obj.strLoginUserId;
      let fkAdminId = obj.fkAdminId;
      let strPassword = obj.strPassword;
      let arryModuleDetails = obj.arryModuleDetails;
      let array = [];
      let sub = [];
      if (arryModuleDetails.length > 0) {
        arryModuleDetails.forEach((element) => {
          element.fkModuleId = ObjectID(element.fkModuleId);
          // element.subModules.forEach((element) => {
          //   sub.push(ObjectID(element));
          // });
          // element.subModules = sub;
          // sub = [];
          array.push(element);
        });
      }

      let updateModules = {
        $set: {
          arryModuleDetails: array,
          strPassword: strPassword,
          strUpdateUserId: ObjectID(strLoginUserId),
          dateUpdateDateAndTime: config.time(),
        },
      };

      let userMatch = {
        fkAdminId: ObjectID(fkAdminId),
      };

      let updateUserModuels = await db
        .collection(config.ADMIN_COLLECTION)
        .updateOne(userMatch, updateModules);

      if (updateUserModuels && updateUserModuels.result["ok"] == 1) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed to update.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funDeleteAdminsUser: async function (obj, db) {
    try {
      let strLoginUserId = obj.strLoginUserId;
      let fkAdminId = obj.fkAdminId;

      let updateModules = {
        $set: {
          strStatus: "D",
          strUpdateUserId: ObjectID(strLoginUserId),
          dateUpdateDateAndTime: new Date(),
        },
      };

      let userMatch = {
        fkAdminId: ObjectID(fkAdminId),
      };

      let updateUserModuels = await db
        .collection(config.ADMIN_COLLECTION)
        .updateOne(userMatch, updateModules);

      if (updateUserModuels && updateUserModuels.result["ok"] == 1) {
        return {
          success: true,
          message: "Success.",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Failed to update.",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  // funGetAllAdmins: async function (obj, db) {
  //   try {
  //     let strLoginUserId = obj.strLoginUserId;
  //     let strSkipCount = parseInt(obj.strSkipCount);
  //     let strPageLimit = parseInt(obj.strPageLimit);
  //     let fkAdminId = obj.fkAdminId;

  //     if (strLoginUserId) {
  //       if (!strSkipCount) {
  //         strSkipCount = 0;
  //       }
  //       let idMatch = {};

  //       let adminMatch = {
  //         strStatus: "N",
  //       };
  //       if (fkAdminId) {
  //         idMatch = {
  //           fkAdminId: ObjectID(fkAdminId),
  //         };
  //       }
  //       let match = { $and: [adminMatch, idMatch] };
  //       let project = {
  //         $project: {
  //           _id: 0,
  //           fkAdminId: 1,
  //           strUserName: 1,
  //           strEmail: 1,
  //           strUserType: 1,
  //           arryModuleDetails: 1,
  //           objShopDetails: 1,
  //         },
  //       };
  //       let adminDetails;
  //       if (fkAdminId) {
  //         adminDetails = await db
  //           .collection(config.ADMIN_COLLECTION)
  //           .aggregate(
  //             {
  //               $match: {
  //                 fkAdminId: ObjectID(fkAdminId),
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: config.ADMIN_MODULES_COLLECTION,
  //                 localField: "arryModuleDetails.fkModuleId",
  //                 foreignField: "fkModuleId",
  //                 as: "moduleDetails",
  //               },
  //             },
  //             {
  //               $project: {
  //                 title: 1,
  //               },
  //             }
  //           )
  //           .toArray();
  //         //take admin submodules id
  //         let adminIds = [];
  //         if (adminDetails && adminDetails.length > 0) {
  //           adminDetails[0].arryModuleDetails.forEach(async (element) => {
  //             element.subModules.forEach((element) => {
  //               adminIds.push(element.toString());
  //             });
  //           });
  //         }
  //         //filter that id's with admin modules deatils array
  //         let validmoduels = [];
  //         adminDetails[0].moduleDetails.forEach((element, index) => {
  //           element.arrSubModule.forEach((object) => {
  //             if (adminIds.includes(object._id.toString())) {
  //               validmoduels.push(object);
  //             } else {
  //             }
  //           });
  //           adminDetails[0].moduleDetails[index].arrSubModule = validmoduels;
  //           validmoduels = [];
  //           index++;
  //         });

  //         if (adminDetails && adminDetails.length > 0) {
  //           delete adminDetails[0].arryModuleDetails;
  //           return {
  //             success: true,
  //             message: "Success.",
  //             data: adminDetails,
  //           };
  //         } else {
  //           return {
  //             success: false,
  //             message: "Failed.",
  //             data: [],
  //           };
  //         }
  //       }

  //       //

  //       let findAdminCount = await db
  //         .collection(config.ADMIN_COLLECTION)
  //         .find(match)
  //         .count();

  //       if (findAdminCount != 0) {
  //         let findAdmin = await db
  //           .collection(config.ADMIN_COLLECTION)
  //           .aggregate([
  //             { $match: match },
  //             { $skip: strSkipCount },
  //             { $limit: strPageLimit },
  //             project,
  //           ])
  //           .toArray();

  //         if (findAdmin && findAdmin.length) {
  //           return {
  //             success: true,
  //             message: "Success.",
  //             data: findAdmin,
  //             count: findAdminCount,
  //           };
  //         } else {
  //           return {
  //             success: false,
  //             message: "No user found.",
  //             data: arrayEmpty,
  //           };
  //         }
  //       } else {
  //         return {
  //           success: false,
  //           message: "No user found.",
  //           data: arrayEmpty,
  //         };
  //       }
  //     } else {
  //       return {
  //         success: false,
  //         message: "Please login to continue.",
  //         data: arrayEmpty,
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       success: false,
  //       message: "System:" + error,
  //       data: arrayEmpty,
  //     };
  //   }
  // },
  //get admin by id
  funGetAdminById: async function (obj, db) {
    try {
      let fkAdminId = obj.fkAdminId;

      if (fkAdminId) {
        adminDetails = await db
          .collection(config.ADMIN_COLLECTION)
          .aggregate(
            {
              $match: {
                fkAdminId: ObjectID(fkAdminId),
              },
            },

            {
              $lookup: {
                from: config.ADMIN_MODULES_COLLECTION,
                localField: "arryModuleDetails.fkModuleId",
                foreignField: "fkModuleId",
                as: "moduleDetails",
              },
            },
            {
              $project: {
                title: 1,
              },
            }
          )
          .toArray();
        //take admin submodules id
        let adminIds = [];
        if (adminDetails && adminDetails.length > 0) {
          adminDetails[0].arryModuleDetails.forEach(async (element) => {
            element.subModules.forEach((element) => {
              adminIds.push(element.toString());
            });
          });
        } else {
          return {
            success: false,
            message: "id does't match.",
            data: [],
          };
        }
        //filter that id's with admin modules deatils array
        let validmoduels = [];
        if (
          adminDetails[0].moduleDetails &&
          adminDetails[0].moduleDetails.length > 0
        ) {
          adminDetails[0].moduleDetails.forEach((element, index) => {
            element.arrSubModule.forEach((object) => {
              if (adminIds.includes(object._id.toString())) {
                validmoduels.push(object);
              } else {
              }
            });
            adminDetails[0].moduleDetails[index].arrSubModule = validmoduels;
            validmoduels = [];
            index++;
          });
        }

        if (adminDetails && adminDetails.length > 0) {
          delete adminDetails[0].arryModuleDetails;
          return {
            success: true,
            message: "Success.",
            data: adminDetails,
          };
        } else {
          return {
            success: false,
            message: "Failed.",
            data: [],
          };
        }
      } else {
        return {
          success: false,
          message: "Failed.",
          data: [],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funStaffLogin: (funStaffLogin = (obj, db) => {
    return new Promise((resolve, reject) => {
      try {
        let strEmail = obj.strEmail;
        let strPassword = obj.strPassword;
        if (strEmail) {
          if (strPassword) {
            let match = {
              $match: {
                strEmail: strEmail,
                strStatus: "N",
              },
            };

            let project = {
              $project: {
                fkAdminId: 1,
                strPassword: 1,
                objShopDetails: 1,
                _id: 0,
              },
            };

            db.collection(config.ADMIN_COLLECTION)
              .aggregate([match, project])
              .toArray()
              .then((doc) => {
                if (doc && doc.length) {
                  let objPasData = {
                    strEmail: obj.strEmail,
                    intUserId: doc[0].fkAdminId,
                  };

                  db.collection(config.ADMIN_COLLECTION)
                    .aggregate([
                      {
                        $match: {
                          // $and: [
                          // {
                          strPassword: strPassword,
                          strEmail: strEmail,
                          strStatus: "N",
                          // ],
                        },
                      },
                      {
                        $project: {
                          _id: 0,
                          fkAdminId: 1,
                          arryModuleDetails: 1,
                          objShopDetails: 1,
                          fkUserTypeId: 1,
                          strUserType: 1,
                        },
                      },
                    ])
                    .toArray()
                    .then((doc1) => {
                      if (doc1 && doc1.length > 0) {
                        if (doc1[0].strUserType == "SUPER-ADMIN") {
                          let modules = db
                            .collection(config.ADMIN_MODULES_COLLECTION)
                            .find({ strStatus: "N" })
                            .toArray()
                            .then((data) => {
                              doc1[0].arryModuleDetails = data;
                            });
                        } else {
                          let adminDetails = db
                            .collection(config.ADMIN_COLLECTION)
                            .aggregate(
                              {
                                $match: {
                                  fkAdminId: ObjectID(doc[0].fkAdminId),
                                },
                              },
                              {
                                $lookup: {
                                  from: config.ADMIN_MODULES_COLLECTION,
                                  localField: "arryModuleDetails.fkModuleId",
                                  foreignField: "fkModuleId",
                                  as: "moduleDetails",
                                },
                              },
                              {
                                $project: {
                                  title: 1,
                                },
                              }
                            )
                            .toArray()
                            .then((result) => {
                              //take admin submodules id
                              let adminIds = [];
                              if (result && result.length > 0) {
                                result[0].arryModuleDetails.forEach(
                                  async (element) => {
                                    element.subModules.forEach((element) => {
                                      adminIds.push(element.toString());
                                    });
                                  }
                                );
                              }
                              //filter that id's with admin modules deatils array
                              let validmoduels = [];
                              result[0].moduleDetails.forEach(
                                (element, index) => {
                                  element.arrSubModule.forEach((object) => {
                                    if (
                                      adminIds.includes(object._id.toString())
                                    ) {
                                      validmoduels.push(object);
                                    } else {
                                    }
                                  });
                                  result[0].moduleDetails[index].arrSubModule =
                                    validmoduels;
                                  validmoduels = [];
                                  index++;
                                }
                              );
                              doc1[0].arryModuleDetails =
                                result[0].moduleDetails;
                            });
                        }

                        if (doc1 && doc1.length) {
                          jwt.sign(
                            {
                              exp: Math.floor(Date.now() / 1000) + 14400,
                              user: objPasData,
                            },
                            config.JWT_SECRET,
                            (err, token) => {
                              let data = { token: token };
                              doc1.push(data);

                              let insertToken = {
                                fkUserId: ObjectID(doc1[0].fkAdminId),
                                data: data,
                                strStatus: "LOGIN",
                                dateCreated: new Date(),
                                dateUpdated: null,
                              };
                              db.collection(config.ADMIN_USER_LOGIN)
                                .insertOne(insertToken)
                                .then((insertLogin) => {
                                  if (
                                    insertLogin &&
                                    insertLogin.result["ok"] == 1
                                  ) {
                                    resolve({
                                      success: true,
                                      message: "Successfully.",
                                      data: doc1,
                                    });
                                  } else {
                                    resolve({
                                      success: false,
                                      message: "Please try again.",
                                      data: arrayEmpty,
                                    });
                                  }
                                });
                            }
                          );
                        } else {
                          resolve({
                            success: false,
                            message: "Invalid user.",
                            data: arrayEmpty,
                          });
                        }
                      } else {
                        resolve({
                          success: false,
                          message: "Invalid user.",
                          data: arrayEmpty,
                        });
                      }
                    });
                } else {
                  resolve({
                    success: false,
                    message: "Invalid user.",
                    data: arrayEmpty,
                  });
                }
              });
          } else {
            resolve({
              success: false,
              message: "Invalid username and password.",
              data: arrayEmpty,
            });
          }
        } else {
          resolve({
            success: false,
            message: "Invalid username and password.",
            data: arrayEmpty,
          });
        }
      } catch (e) {
        console.log(e, config);
        throw resolve({
          success: false,
          message: "System " + e,
          data: arrayEmpty,
        });
      }
    });
  }),
  funLogOut: async function (obj, db) {
    try {
      let strLoginUserId = obj.strLoginUserId;
      let strtoken = obj.strtoken;

      if (strLoginUserId) {
        let updateMatch = {
          fkUserId: ObjectID(strLoginUserId),
          strStatus: "LOGIN",
          "data.token": strtoken,
        };

        let updateData = {
          $set: { dateUpdated: new Date(), strStatus: "LOGOUT" },
        };

        let updateUser = await db
          .collection(config.ADMIN_USER_LOGIN)
          .updateOne(updateMatch, updateData);

        return {
          success: true,
          message: "Success",
          data: arrayEmpty,
        };
      } else {
        return {
          success: false,
          message: "Please login to continue",
          data: arrayEmpty,
        };
      }
    } catch (error) {
      return {
        success: true,
        message: "System: " + error,
        data: arrayEmpty,
      };
    }
  },
};
