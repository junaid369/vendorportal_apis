const config = require("../config/config");
// const common = require("../global/common");
const sitesViewSchema = require("../models/sites_view-model");
const poViewSchema = require("../models/po_view-model");
const poDetailViewSchema = require("../models/po_Detail_view-model");
const poFooterViewSchema = require("../models/po_footer-modal");
const grnHeaderViewSchema = require("../models/grn_header_view-modal");
const grnDetailViewSchema = require("../models/grn_detail_view-modal");
const stockViewSchema = require("../models/stock_view-model");

const arrayEmpty = [];

module.exports = {
  //view status
  funViewPoView: async function (obj, db) {
    try {
      let po_No = obj.po_No;
      let intSkipCount = parseInt(obj.intSkipCount);
      let intLimitCount = parseInt(obj.intLimitCount);
      let result = [
        {
          DetailView: [],
          footerView: [],
        },
      ];
      if (!intLimitCount) {
        return {
          success: false,
          message: "limit count is missing.",
          data: [],
        };
      }

      if (!intSkipCount) {
        intSkipCount = 0;
      }

      if (po_No) {
        let poHeaderView = await poDetailViewSchema.aggregate([
          {
            $match: {
              po_No: po_No,
            },
          },
          // { $skip: intSkipCount },
          // { $limit: intLimitCount },
        ]);
        if (poHeaderView.length > 0) {
          // poFooterViewSchema
          let footer = await poFooterViewSchema.aggregate([
            {
              $match: {
                po_No: po_No,
              },
            },
          ]);
          result[0].DetailView = poHeaderView;
          result[0].footerView = footer;

          return {
            success: true,
            message: "Success.",
            data: result,
            count: poHeaderView.length,
          };
        } else {
          return {
            success: false,
            message: "Not macthing any Documentd.",
            data: [],
          };
        }
      } else {
        let poHeaderView = await poViewSchema.aggregate([
          { $match: {} },
          { $skip: intSkipCount },
          { $limit: intLimitCount },
        ]);

        if (poHeaderView.length > 0) {
          return {
            success: true,
            message: "Success.",
            data: poHeaderView,
            count: poHeaderView.length,
          };
        } else {
          return {
            success: false,
            message: "Not macthing any Documentd.",
            data: [],
          };
        }
      }
    } catch (error) {
      // console.log(error,"__");
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funUpdateGrnHeader: async function (db, connection) {
    try {
      let newData = [];

      // Initialize offset and limit
      let offset = 0;
      const limit = 20000; // Adjust this value based on your memory constraints

      let hasMoreData = true;
      while (hasMoreData) {
        // Fetch data from Oracle in chunks
        const data = await fetchDataFromOracle(offset, limit);

        // Insert or update data in MongoDB
        await synchronizeDataWithMongo(data);

        // Update offset for next iteration
        offset += limit;
        // Check if there are more records to fetch
        hasMoreData = data.length === limit;
        newData.length = 0;
      }

      console.log(`Synchronization for table  completed successfully.`);

      // Function to fetch data from Oracle with pagination
      async function fetchDataFromOracle(offset, limit) {
        try {
          const result = await connection.execute(
            `SELECT *
             FROM (
               SELECT t.*, ROWNUM rnum
               FROM (
                select * from SPAR_GRN_Header_View
               ) t
               WHERE ROWNUM <= :limit + :offset
             )
             WHERE rnum > :offset`,
            {
              limit: limit,
              offset: offset,
            }
          );

          if (result.rows) {
            const jsonObject = result.rows.reduce((acc, row) => {
              let obj = {
                SITE: row[0],
                Site_Name: row[1],
                Po_No: row[2],
                Po_Date: config.uaeTime(row[3]),
                Supp_No: row[4],
                Addr_Chain: row[5],
                CC: row[6],
                // glob_order: row[7],
                Grn_No: row[7],
                Grn_Dt: config.uaeTime(row[8]),
                Grn_User: row[9],
                Int_Grn_no: row[10],
                Integration_Dt: row[11],
                Valuation_Dt: row[12],
                CARRIER: row[13],
                Trans_Grp: row[14],
                Seal_No: row[15],
                Dn_No: row[16],
                Accquired_No: row[17],
                OBSERVATIONS: row[18],
                Comp_Name_Supp: row[19],
                Street1_Supp: row[20],
                Street2_Supp: row[21],
                Postal_Code_Supp: row[22],
                Villa_Supp: row[23],
                District_Supp: row[24],
                Region_Supp: row[25],
                Country_Supp: row[26],
                Vat_Code_Supp: row[27],
                Comp_Name_Cust: row[28],
                Street1_Cust: row[29],
                Street2_Cust: row[30],
                Postal_Code_Cust: row[31],
                Villa_cust: row[32],
                District_Cust: row[33],
                Region_Cust: row[34],
                Country_Cust: row[35],
                Vat_Code_Cust: row[36],
                Customer_Number: row[37],
                Currency_Code: row[38],
                CURRENCY: row[39],
                Exchange_Rate: row[40],
                STATMENT1: row[41],
                Pay_Type: row[42],
                Subject_Vat: row[43],
                Pay_Due_Date: row[44],
                Dt_Cre: config.uaeTime(row[45]),
                Dt_Mod: config.uaeTime(row[46]),
              };
              newData.push(obj);
            }, {});
          }

          return newData;
        } catch (error) {
          console.log(error);
        }
      }

      // Function to synchronize data with MongoDB
      async function synchronizeDataWithMongo(data) {
        let exisitingData = await grnHeaderViewSchema.aggregate([
          { $match: {} },
          {
            $project: {
              _id: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
            },
          },
        ]);

        if (exisitingData.length == 0) {
          let insertQuery = await grnHeaderViewSchema.insertMany(data);
        } else {
          data.forEach(async (obj1) => {
            const obj2 = exisitingData.find(
              (item) => item.Po_No === obj1.Po_No
            );

            if (obj2) {
              const hasChanges = JSON.stringify(obj1) !== JSON.stringify(obj2);
              if (hasChanges) {
                await grnHeaderViewSchema.updateOne(
                  { Po_No: obj1.Po_No },
                  { $set: obj1 }
                );
              } else {
              }
            } else {
              await grnHeaderViewSchema.create(obj1);
            }
          });
        }
      }

      // synchronizeDataFromOracleToMongo();
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funUpdateGrnHeaderDetail: async function (db, connection) {
    try {
      let newData = [];

      // Initialize offset and limit
      let offset = 0;
      const limit = 20000; // Adjust this value based on your memory constraints

      let hasMoreData = true;
      while (hasMoreData) {
        // Fetch data from Oracle in chunks
        const data = await fetchDataFromOracle(offset, limit);

        // Insert or update data in MongoDB
        await synchronizeDataWithMongo(data, offset, limit);
        console.log(data.length);

        // Update offset for next iteration
        offset += limit;
        // Check if there are more records to fetch
        hasMoreData = data.length === limit;
        console.log(hasMoreData);
        newData.length = 0;
      }

      console.log(`Synchronization for table  completed successfully.`);

      // Function to fetch data from Oracle with pagination
      async function fetchDataFromOracle(offset, limit) {
        try {
          const result = await connection.execute(
            `SELECT *
             FROM (
               SELECT t.*, ROWNUM rnum
               FROM (
                select * from SPAR_GRN_Detail_View
               ) t
               WHERE ROWNUM <= :limit + :offset
             )
             WHERE rnum > :offset`,
            {
              limit: limit,
              offset: offset,
            }
          );

          if (result.rows) {
            const jsonObject = result.rows.reduce((acc, row) => {
              let obj = {
                Po_No: row[0],
                Po_Int_Code: row[1],
                Glob_Int_Code: row[2],
                Glob_order: row[3],
                Int_Grn_No: row[4],
                Site_Code: row[5],
                Prod_Code: row[6],
                BARCODE: row[7],
                Supp_Ref_Code: row[8],
                LV: row[9],
                LU: row[10],
                Product_Desc: row[11],
                Orig_Country: row[12],
                LINENO: row[13],
                Order_Qty_Pcs: row[14],
                Free_Qty: row[15],
                Back_Order_Qty: row[16],
                Refused_Qty: row[17],
                Received_Qty_Pcs: row[18],
                Qty_Unit: row[19],
                Gross_Pp: row[20],
                DISCPERC: row[21],
                DISCVALUE: row[22],
                Net_Pp: row[23],
                Pp_Unit: row[24],
                VAT: row[25],
                Line_Total: row[26],
                Line_Total_Sales: row[27],
                MARGPERC: row[28],
                Vat_Value: row[29],
                Recived_Weight: row[30],
                Free_Weight: row[31],
                Refused_Weight: row[32],
                ARTUSTK: row[33],
                Received_Packs: row[34],
                Spl_Oper: row[35],
                Sales_Price: row[36],
                Grn_No: row[37],
                CINR: row[38],
                CINL: row[39],
                SEQVL: row[40],
              };
              newData.push(obj);
            }, {});
          }

          return newData;
        } catch (error) {
          console.log(error);
        }
      }

      // Function to synchronize data with MongoDB
      async function synchronizeDataWithMongo(data, offset, limit) {
        let exisitingData = await grnDetailViewSchema.aggregate([
          { $match: {} },
          { $skip: offset },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
            },
          },
        ]);

        if (exisitingData.length == 0) {
          let insertQuery = await grnDetailViewSchema.insertMany(data);
        } else {
          data.forEach(async (obj1) => {
            const obj2 = exisitingData.find(
              (item) =>
                item.Po_No === obj1.Po_No && item.LINENO === obj1.LINENOc
            );

            if (obj2) {
              const hasChanges = JSON.stringify(obj1) !== JSON.stringify(obj2);
              if (hasChanges) {
                await grnDetailViewSchema.updateOne(
                  { Po_No: obj1.Po_No },
                  { $set: obj1 }
                );
              } else {
              }
            } else {
              await grnDetailViewSchema.create(obj1);
            }
          });
        }
      }

      // synchronizeDataFromOracleToMongo();
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funUpdateStockView: async function (db, connection) {
    try {
      console.log("stock view inside mani function");
      let newData = [];
      let status = true;

      // Initialize offset and limit
      let offset = 360000;
      const limit = 60000; // Adjust this value based on your memory constraints

      let hasMoreData = true;
      while (hasMoreData) {
        if (status == true) {
          await stockViewSchema.deleteMany({});
          status = false;
        }
        // Fetch data from Oracle in chunks
        const data = await fetchDataFromOracle(offset, limit);

        console.log(data.length, "first");
        // Insert or update data in MongoDB

        if (data.length > 0) {
          await synchronizeDataWithMongo(data, offset, limit);
        }

        console.log(data.length);

        // Update offset for next iteration
        offset += limit;
        // Check if there are more records to fetch
        hasMoreData = data.length === limit;
        console.log(hasMoreData);
        newData.length = 0;
      }

      console.log(`Synchronization for table  completed successfully.`);

      // Function to fetch data from Oracle with pagination
      async function fetchDataFromOracle(offset, limit) {
        try {
          const result = await connection.execute(
            `SELECT *
             FROM (
               SELECT t.*, ROWNUM rnum
               FROM (
                select * from SPAR_STOCK_DETAILS_VIEW
               ) t
               WHERE ROWNUM <= :limit + :offset
             )
             WHERE rnum > :offset`,
            {
              limit: limit,
              offset: offset,
            }
          );

          if (result.rows) {
            const jsonObject = result.rows.reduce((acc, row) => {
              let obj = {
                Site_Group: row[0],
                STOSITE: row[1],
                Site_Name: row[2],
                Article_Code: row[3],
                Supp_No: row[4],
                BARCODE: row[5],
                Sales_Variant: row[6],
                Sv_Desc_Long_Eng: row[7],
                STOCKQTY: row[8],
                Stockqty_Block: row[9],
                Total: row[10],
                DIV: row[11],
                DIVISION: row[12],
                SEC: row[13],
                SECTION: row[14],
                BRAND: row[15],
                STOCKVALUE: row[16],
                StockValue_Block: row[17],
                Total_Value: row[18],
              };
              newData.push(obj);
            }, {});
          }

          return newData;
        } catch (error) {
          console.log(error);
        }
      }

      // Function to synchronize data with MongoDB
      async function synchronizeDataWithMongo(data, offset, limit) {
        let insertQuery = await stockViewSchema.insertMany(data);

        //   console.log(offset, limit, "count and limit");
        //   let exisitingData = await stockViewSchema.aggregate([
        //     { $match: {} },
        //     { $skip: offset },
        //     { $limit: limit },
        //     {
        //       $project: {
        //         _id: 0,
        //         createdAt: 0,
        //         updatedAt: 0,
        //         __v: 0,
        //       },
        //     },
        //   ]);

        //   if (exisitingData.length == 0) {
        //     let insertQuery = await stockViewSchema.insertMany(newData);
        //   } else {
        //     // Check for updates and insertions
        //     await data.forEach(async (obj1) => {
        //       const matchingObj = await exisitingData.find(
        //         (obj2) =>
        //           obj2.Sales_Variant &&
        //           obj2.STOSITE === obj1.Sales_Variant &&
        //           obj1.STOSITE
        //       );
        //       if (matchingObj) {
        //         // Update

        //         const hasChanges =
        //           JSON.stringify(obj1) !== JSON.stringify(matchingObj);

        //         if (hasChanges) {

        //           await stockViewSchema.updateOne(
        //             {
        //               STOSITE: obj2.STOSITE,
        //               Sales_Variant: obj2.Sales_Variant,
        //             },
        //             { $set: obj1 }
        //           );

        //           //update mogondb
        //         } else {
        //           //nothing doing
        //         }
        //       } else {
        //         //insert new
        //         let insertQuery = await stockViewSchema.create(obj1);
        //       }
        //     });

        //     // Check for deletions
        //     exisitingData.forEach(async (obj2) => {
        //       const matchingObj = data.find(
        //         (obj1) =>
        //           obj2.Sales_Variant &&
        //           obj2.STOSITE === obj1.Sales_Variant &&
        //           obj1.STOSITE
        //       );
        //       if (!matchingObj) {
        //         // Deletion
        //         await stockViewSchema.deleteOne({
        //           STOSITE: obj2.STOSITE,
        //           Sales_Variant: obj2.Sales_Variant,
        //         });
        //       }
        //     });
        //   }
      }

      // synchronizeDataFromOracleToMongo();
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
  funUpdateStockViewDayChanges: async function (db, connection) {
    try {
      console.log("inside main day view");
      let newData = [];

      // Initialize offset and limit
      let offset = 240000;
      const limit = 8000; // Adjust this value based on your memory constraints

      let hasMoreData = true;
      while (hasMoreData) {
        // Fetch data from Oracle in chunks
        const data = await fetchDataFromOracle(offset, limit);

        // Insert or update data in MongoDB
        console.log(data.length, "first");

        await synchronizeDataWithMongo(data, offset, limit);
        console.log(data.length);

        // Update offset for next iteration
        offset += limit;
        // Check if there are more records to fetch
        hasMoreData = data.length === limit;
        console.log(hasMoreData);
        newData.length = 0;
      }

      console.log(`Synchronization for table  completed successfully.`);

      // Function to fetch data from Oracle with pagination
      async function fetchDataFromOracle(offset, limit) {
        try {
          const result = await connection.execute(
            `SELECT *
             FROM (
               SELECT t.*, ROWNUM rnum
               FROM (
                select * from SPAR_STOCK_DETAILS_DAY_CHANGE_VIEW
               ) t
               WHERE ROWNUM <= :limit + :offset
             )
             WHERE rnum > :offset`,
            {
              limit: limit,
              offset: offset,
            }
          );

          if (result.rows) {
            const jsonObject = result.rows.reduce((acc, row) => {
              let obj = {
                Site_Group: row[0],
                STOSITE: row[1],
                Site_Name: row[2],
                Article_Code: row[3],
                Supp_No: row[4],
                BARCODE: row[5],
                Sales_Variant: row[6],
                Sv_Desc_Long_Eng: row[7],
                STOCKQTY: row[8],
                Stockqty_Block: row[9],
                Total: row[10],
                DIV: row[11],
                DIVISION: row[12],
                SEC: row[13],
                SECTION: row[14],
                BRAND: row[15],
                STOCKVALUE: row[16],
                StockValue_Block: row[17],
                Total_Value: row[18],
              };
              newData.push(obj);
            }, {});
          }

          return newData;
        } catch (error) {
          console.log(error);
        }
      }

      // Function to synchronize data with MongoDB
      async function synchronizeDataWithMongo(data, offset, limit) {
        let inArraysSite = [];

        data.forEach((element) => {
          inArraysSite.push({
            STOSITE: element.STOSITE,
            Sales_Variant: element.Sales_Variant,
          });
        });

        // let deleteStocks = await stockViewSchema.deleteMany({
        //   $or: inArraysSite.map((input) => ({
        //     $and: [
        //       { STOSITE: input.STOSITE },
        //       { Sales_Variant: input.Sales_Variant },
        //     ],
        //   })),
        // });
        let deleteStocks = await stockViewSchema.deleteMany({
          $or: inArraysSite,
        });

        // $or: [
        //   { id: yourId1, age: yourAge1 },
        //   { id: yourId2, age: yourAge2 },
        //   { id: yourId3, age: yourAge3 },
        //   // Add more pairs as needed
        // ]
        console.log(deleteStocks, "delete");
        let insertStocks = await stockViewSchema.insertMany(data);
        console.log(insertStocks.length, "insert lenght");
      }

      // synchronizeDataFromOracleToMongo();
    } catch (error) {
      return {
        success: false,
        message: "System:" + error,
        data: arrayEmpty,
      };
    }
  },
};
