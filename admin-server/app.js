let express = require("express");
const mongoose = require("mongoose");
const oracledb = require("oracledb");
const config = require("./config/config"); // importing config file
const cron = require("node-cron");
const bcrypt = require("bcrypt");
let common = require("./global/common");

require("dotenv").config();
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
//scema fetch
const sitesViewSchema = require("./models/sites_view-model");
const poHeaderViewSchema = require("./models/po_view-model");
const grnHeaderViewSchema = require("./models/grn_header_view-modal");
const poDetailViewSchema = require("./models/po_Detail_view-model");
const grnDetailViewSchema = require("./models/grn_detail_view-modal");
const poFooterViewSchema = require("./models/po_footer-modal");
const grnFooterViewSchema = require("./models/grn_footer-modal");
const suppViewSchema = require("./models/supp_view-modal");
const itemMasterViewSchema = require("./models/item_master_view-modal");
const msViewSchema = require("./models/ms_view-modal");
const stockViewSchema = require("./models/stock_view-model");
const slaViewSchema = require("./models/sla_view-modal");

const service = require("./service/Viewreports-service");

//end

let app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "PUT, GET, POST, DELETE, HEAD, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//app.use(fileUpload()); / Parsers
app.use(logger("dev"));
app.use(express.json({ limit: "200mb" }));
app.use(
  express.urlencoded({
    limit: "200mb",
    extended: true,
    parameterLimit: 50000000000,
  })
);

app.use(cors());
let originsWhitelist = [
  //this is my front-end url for development

  "http://localhost:4200",
];

let corsOptions = {
  origin: function (origin, callback) {
    let isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  },
  credentials: true,
};
//here is the cors magic
app.use(cors(corsOptions));
// process.env.TZ = "Asia/Riyadh";

// Now new Date() will return the correct local time in Saudi Arabia

//oracle db connection
const dbConfig = {
  // user: config.USERNAME,
  // password: config.PASSWORD,
  // connectString: config.CONNECTION_STRING,
  user: "VENDORPORTAL",
  password: "VENDORPORTAL",
  connectString: "192.168.14.237:1521/ESTK",
  // poolMax: 10, // Maximum number of connections in the pool
  // poolMin: 2, // Minimum number of connections in the pool
  // poolIncrement: 2, // Number of connections to add when needed
};

async function run() {
  let connection;

  try {
    // Establish a connection
    connection = await oracledb.getConnection(dbConfig);
    // Your database operations go here

    if (connection) {
      console.log("Connected to oracleDB");

      mongoose.connect(config.CONNECTION_URL, {
        //  dbName: config.DATABASE_NAME, // Specify the database name here
        // Other options can be added here based on your requirements
      });
      const db = mongoose.connection;
      console.log(new Date());

      //db insert

      //end

      db.on("error", console.error.bind("MongoDB connection error:"));
      db.once("open", () => {
        //cron job setup
        const poFunctions = async () => {
          await poFunction();
          await poDetailFunction();
          await poFooterFunction();
        };

        const grnFunctions = async () => {
          await grnFunction(db, connection);
          await grnDetailFunction(db, connection);
          await grnFooterFunction();
        };
        const stockqtyFunctions = async () => {
          await stockqtyFunction(db, connection);
        };
        const stockqtyFunctionsDayChanges = async () => {
          await stockqtyFunctionDayChang(db, connection);
        };

        cron.schedule("25 5 * * *", stockqtyFunctions);
        cron.schedule("22 8 * * *", poFunctions);
        cron.schedule("27 9 * * *", grnFunctions);
        cron.schedule("0 10 * * *", scheduledFunction);
        cron.schedule("5 10 * * *", suppFunction);
        cron.schedule("10 10 * * *", sparMsViewFunction);
        cron.schedule("19 11 * * *", itemMasterViewFunction);
        cron.schedule("34 9,12,15,18 * * *", stockqtyFunctionsDayChanges);
        // cron.schedule("8 12,18,3 * * *", slaViewFunction);
        //end
        console.log("Connected to MongoDB");
        require("./routes")(app, db);
        app.use(express.static(path.join(__dirname, "dist")));
        // Catch all other routes and return the index file
        app.get("*", function (req, res) {
          res.sendFile(path.join(__dirname, "dist/index.html"));
        });
        // Initialize the app
        let server = app.listen(process.env.PORT || 3001, function () {
          let port = server.address().port;
          console.log("App now running on http://localhost", +port);
        });
      });
    }
    // Your function to be executed
    const scheduledFunction = async () => {
      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute("select * from SPAR_SITES_VIEW");
      await connection.close(); // Release the connection back to the pool
      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            siteCode: row[0],
            siteName: row[1],
            steCls: row[2],
            siteClass: row[3],
            siteGroup: row[4],
          };
          newData.push(obj);
        }, {});

        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await sitesViewSchema.aggregate([
            { $match: {} },
            {
              $project: {
                siteCode: 1,
                siteName: 1,
                steCls: 1,
                siteClass: 1,
                siteGroup: 1,
                _id: 0,
              },
            },
          ]);

          if (exisitingData.length == 0) {
            let insertQuery = await sitesViewSchema.insertMany(newData);
          } else {
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.siteCode === obj1.siteCode
              );

              if (obj2) {
                if (obj1 == obj2) {
                } else {
                  await sitesViewSchema.updateOne(
                    { siteCode: obj1.siteCode },
                    { $set: obj1 }
                  );
                }
              } else {
                await sitesViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };

    async function poFunction() {
      console.log("inside the po function", new Date());
      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_PO_Header_View"
      );
      console.log(result.rows.length, "____________");
      // await connection.close(); // Release the connection back to the pool
      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            po_No: row[0],
            supp_Name: row[1],
            po_Int_Code: row[2],
            glob_order: row[3],
            site_Code: row[4],
            ECDCFIN: row[5],
            Supp_No: row[6],
            comm_Contract: row[7],
            adress_chain_supp: row[8],
            po_Comments: row[9],
            po_Date: config.uaeTime(row[10]),
            delivery_Date: config.uaeTime(row[11]),
            delivery_Deadline: config.uaeTime(row[12]),
            free_Shipping: row[13],
            address_Chain_Cust: row[14],
            COMMENT1: row[15],
            COMMENT2: row[16],
            comp_Name_Supp: row[17],
            street1_Supp: row[18],
            street2_Supp: row[19],
            postal_Code_Supp: row[20],
            villa_Supp: row[21],
            district_Supp: row[22],
            region_Supp: row[23],
            country_Supp: row[24],
            vat_Code_Supp: row[25],
            comp_Name_Cust: row[26],
            street1_Cust: row[27],
            street2_Cust: row[28],
            postal_Code_Cust: row[29],
            villa_cust: row[30],
            district_Cust: row[31],
            region_Cust: row[32],
            country_Cust: row[33],
            vat_Code_Cust: row[34],
            customer_Number: row[35],
            po_Article_Sort: row[36],
            vat_Code_Cust: row[36],
            po_Status: row[37],
            exchange_Rate: row[38],
            CURRENCY: row[39],
          };
          newData.push(obj);
        }, {});

        if (newData.length > 0) {
          //fetch mongodb datas
          let exisitingData = await poHeaderViewSchema.find();
          console.log(exisitingData.length, "---------");

          if (exisitingData.length == 0) {
            let insertQuery = await poHeaderViewSchema.insertMany(newData);
            console.log("insert po ");
            return "Success";
          } else {
            //delet first
            await poHeaderViewSchema.deleteMany({});
            let insertQuery = await poHeaderViewSchema.insertMany(newData);
            console.log("update po ");
            return "Success";
          }
        }
      }
    }
    const poDetailFunction = async () => {
      console.log("inside the detailpo function", new Date());

      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_PO_Detail_View"
      );

      // await connection.close(); // Release the connection back to the pool
      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            po_No: row[0],
            po_Int_Code: row[1],
            glob_Int_Code: row[2],
            glob_order: row[3],
            site_Code: row[4],
            prod_Code: row[5],
            supp_Ref_Code: row[6],
            BARCODE: row[7],
            product_Desc: row[8],
            ou_Type: row[9],
            LV: row[10],
            sku_Ou: row[11],
            weight_Ou: row[12],
            qty_Ordered_Ou: row[13],
            free_Qty: row[14],
            GROSSPRICE: row[15],
            DISCPERC: row[16],
            DISCVALUE: row[17],
            excise_Tax: row[18],
            NETPRICE: row[19],
            vat_Perc: row[20],
            pp_Unit: row[21],
            NETPVALUE: row[22],
            CINR: row[23],
            CINL: row[24],
            SEQVL: row[25],
            po_LineNo: row[26],
            qty_Ordered_Pcs: row[27],
          };
          newData.push(obj);
        }, {});

        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await poDetailViewSchema.find();
          console.log(exisitingData.length, "---------");

          if (exisitingData.length == 0) {
            console.log("here");
            let insertQuery = await poDetailViewSchema.insertMany(newData);
            console.log("insert po detail");
            return "Success";
          } else {
            console.log("update podetail");

            //delet first
            await poDetailViewSchema.deleteMany({});
            let insertQuery = await poDetailViewSchema.insertMany(newData);
            return "Success";
          }
        }
      }
    };
    const poFooterFunction = async () => {
      console.log("inside the footer function", new Date());

      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_PO_Footer_View"
      );

      // await connection.close(); // Release the connection back to the pool
      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            po_No: row[0],
            po_Int_Code: row[1],
            glob_Int_Code: row[2],
            glob_order: row[3],
            site_Code: row[4],
            cnt_Articles: row[5],
            cnt_Pu: row[6],
            cnt_Sku: row[7],
            tot_Gross: row[8],
            tot_Linedisc: row[9],
            excise_Tax: row[10],
            footer_Disc: row[11],
            net_Pval: row[12],
            landed_Cost: row[13],
            total_Vat: row[14],
            total_Amt_W_Vat: row[15],
          };
          newData.push(obj);
        }, {});

        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await poFooterViewSchema.find();
          console.log(exisitingData.length, "---------");

          if (exisitingData.length == 0) {
            console.log("here");
            let insertQuery = await poFooterViewSchema.insertMany(newData);
            console.log("insert po detail");
            return "Success";
          } else {
            console.log("update podetail");

            //delet first
            await poFooterViewSchema.deleteMany({});
            let insertQuery = await poFooterViewSchema.insertMany(newData);
            return "Success";
          }
        }
      }
    };
    // grn Function

    async function grnFunction(db, connection) {
      try {
        const data = await service.funUpdateGrnHeader(db, connection);
      } catch (error) {}
    }
    async function grnDetailFunction(db, connection) {
      try {
        const data = await service.funUpdateGrnHeaderDetail(db, connection);
      } catch (error) {}
    }

    const grnFooterFunction = async () => {
      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_GRN_Footer_View"
      );
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the grn footer count", result.rows.length);

      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            Po_No: row[0],
            Po_Int_Code: row[1],
            Glob_Int_Code: row[2],
            Glob_order: row[3],
            Site_Code: row[4],
            Int_Grn_No: row[5],
            Grn_No: row[6],
            Dn_No: row[7],
            Grn_Dt: row[8],
            Cnt_Articles: row[9],
            Cnt_Pu: row[10],
            Cnt_Sku: row[11],
            Tot_Gross: row[12],
            Tot_Linedisc: row[13],
            Excise_Tax: row[14],
            Footer_Disc: row[15],
            Net_Pval: row[16],
            Landed_Cost: row[17],
            Total_Vat: row[18],
            Total_Amt_W_Vat: row[19],
            Total_Sales_Aft_Tax: row[20],
          };
          newData.push(obj);
        }, {});
        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await grnFooterViewSchema.aggregate([
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
            let insertQuery = await grnFooterViewSchema.insertMany(newData);
          } else {
            console.log("update grn footer");
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.Po_No === obj1.Po_No
              );

              if (obj2) {
                // if (obj1 == obj2) {
                // } else {
                //   await grnFooterViewSchema.updateOne(
                //     { Po_No: obj1.Po_No },
                //     { $set: obj1 }
                //   );
                // }

                const hasChanges =
                  JSON.stringify(obj1) !== JSON.stringify(obj2);
                if (hasChanges) {
                  await grnFooterViewSchema.updateOne(
                    { Po_No: obj1.Po_No },
                    { $set: obj1 }
                  );
                } else {
                }
              } else {
                await grnFooterViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };
    const itemMasterViewFunction = async () => {
      let newData = [];
      console.log("___________");
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_ITEM_MASTER_VIEW"
      );
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the itemmaster count", result.rows.length);

      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            ARTCINR: row[0],
            Article_Code: row[1],
            Article_Descr_En: row[2],
            Article_Descr_Ar: row[3],
            Sales_Variant: row[4],
            Sv_Descr_Long_En: row[5],
            Sv_Descr_Long_Ar: row[6],
            BARCODE: row[7],
            ARTTYPP: row[8],
            ARTTYPE: row[9],
            ARTUSTK: row[10],
            Stock_Unit: row[11],
            ARTETAT: row[12],
            STATUS: row[13],
            CONSIGNMENT: row[14],
            DIV: row[15],
            DIVISION: row[16],
            DEPT: row[17],
            DEPARTMENT: row[18],
            SEC: row[19],
            SECTION: row[20],
            CAT: row[21],
            CATEGORY: row[22],
            SCAT: row[23],
            SUB_CATEGORY: row[24],
            SSCAT: row[25],
            SUB_SUB_SCABTEGORY: row[26],

            BRAND: row[27],
            Kvl_Flag: row[28],
            Main_Supplier: row[29],
            ARVETAT: row[30],
            Sv_Status: row[31],
            Main_Sv: row[32],
            PACK: row[33],
            ARVCVX: row[34],
          };
          newData.push(obj);
        }, {});
        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await itemMasterViewSchema.aggregate([
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
            let insertQuery = await itemMasterViewSchema.insertMany(newData);
          } else {
            console.log("update items master view");
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.Po_No === obj1.Po_No
              );

              if (obj2) {
                const hasChanges =
                  JSON.stringify(obj1) !== JSON.stringify(obj2);
                if (hasChanges) {
                  await itemMasterViewSchema.updateOne(
                    { Po_No: obj1.Po_No },
                    { $set: obj1 }
                  );
                } else {
                }
              } else {
                await itemMasterViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };
    const sparMsViewFunction = async () => {
      let newData = [];
      console.log("___________inside ms view");
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute("select * from SPAR_MS_NEW_VIEW");
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the msview count", result.rows.length);

      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            DIV: row[0],
            DIVISION: row[1],
            DEPT: row[2],
            DPEARTMENT: row[3],
            SEC: row[4],
            SECTION: row[5],
            CAT: row[6],
            CATEGORY: row[7],
            SCAT: row[8],
            SUB_CATEGORY: row[9],
            SSCAT: row[10],
            SUB_SUB_CATEGORY: row[11],
            MERCHPATH: row[12],
            MERCH_PATH: row[13],
            ITEM_COUNT: row[14],
          };
          newData.push(obj);
        }, {});
        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await msViewSchema.aggregate([
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
            let insertQuery = await msViewSchema.insertMany(newData);
          } else {
            console.log("update  view");
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.MERCHPATH === obj1.MERCHPATH
              );

              if (obj2) {
                const hasChanges =
                  JSON.stringify(obj1) !== JSON.stringify(obj2);
                if (hasChanges) {
                  await msViewSchema.updateOne(
                    { MERCHPATH: obj1.MERCHPATH },
                    { $set: obj1 }
                  );
                } else {
                }
              } else {
                await msViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };

    //supplier view
    const suppFunction = async () => {
      let newData = [];
      const result = await connection.execute(
        "select * from SPAR_SUPPLIERS_VIEW"
      );
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the supp", result.rows.length);

      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            VENDOR: row[0],
            FOUCFIN: row[1],
            Vendor_Name: row[2],
            STAT: row[3],
            STATUS: row[4],
            Supplier_Type: row[5],
            Supplier_Category: row[6],
          };
          newData.push(obj);
        }, {});
        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await suppViewSchema.aggregate([
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

          console.log(exisitingData.length, "exisiting document");

          if (exisitingData.length == 0) {
            console.log("insert document");
            let insertQuery = await suppViewSchema.insertMany(newData);
          } else {
            console.log("update query");
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.VENDOR === obj1.VENDOR
              );

              if (obj2) {
                const hasChanges =
                  JSON.stringify(obj1) !== JSON.stringify(obj2);
                if (hasChanges) {
                  await suppViewSchema.updateOne(
                    { VENDOR: obj1.VENDOR },
                    { $set: obj1 }
                  );
                } else {
                }
                //     if (obj1 == obj2) {
                //     } else {

                // console.log("update query+++++++++",obj1,obj2);

                //       await suppViewSchema.updateOne(
                //         { VENDOR: obj1.VENDOR },
                //         { $set: obj1 }
                //       );
                //     }
              } else {
                console.log("update query______", obj1);

                await suppViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };

    //stock qty

    const stockqtyFunction = async (db, connection) => {
      console.log("inside stock");

      const data = await service.funUpdateStockView(db, connection);
    };
    const stockqtyFunctionDayChang = async (db, connection) => {
      console.log("inside stock",new Date());

      const data = await service.funUpdateStockViewDayChanges(db, connection);
    };
    const slaViewFunction = async () => {
      console.log("sla");
      let newData = [];
      const limitValue = 80000; // specify the number of rows to limit
      const offsetValue = 240000; // specify the offset value

      const result = await connection.execute(
        `SELECT *
         FROM (
           SELECT t.*, ROWNUM rnum
           FROM (
             SELECT *
             FROM SPAR_PO_VS_GRN_SERVLVL_VIEWH
           ) t
           WHERE ROWNUM <= :limit + :offset
         )
         WHERE rnum > :offset`,
        {
          limit: limitValue,
          offset: offsetValue,
        }
      );
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the sl", result.rows.length);

      if (result.rows) {
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            Location_Id: row[0],
            Po_Date: config.uaeTime(row[1]),
            Selection_Date_Po: config.uaeTime(row[2]),
            Grn_Date: config.uaeTime(row[3]),
            Selection_Date_Grn: config.uaeTime(row[4]),
            ECDDLIM: config.uaeTime(row[5]),
            Order_Type: row[6],
            Order_Type_Desc: row[7],
            Po_No: row[8],
            Int_Grn_No: row[9],
            Ext_Grn_No: row[10],
            Delv_Note_No: row[11],
            ARTUSTK: row[12],
            Vat_Code: row[13],
            Po_Status: row[14],
            Po_Line_Status: row[15],
            Supp_No: row[16],
            Supplier_Name: row[17],
            Cc_No: row[18],
            DEPTCODE: row[19],
            DEPTDESC: row[20],
            SECTCODE: row[21],
            SECTDESC: row[22],
            Product_Code: row[23],
            LV: row[24],
            Lu_Description: row[25],
            Order_Unit: row[26],
            Pck_Size: row[27],
            Order_Sku: row[28],
            Order_Sku_Pck: row[29],
            Po_Net_Value: row[30],
            Rec_Qte: row[31],
            Rec_Qte_Pck: row[32],
            Rec_Value: row[33],
            Diff_Qty: row[34],
            Diff_Qty_Pck: row[35],
            Diff_Value: row[36],
            Qty_Serv_Lvl: row[37],
            Val_Serv_Lvl: row[38],
            CINR: row[39],
            CINL: row[40],
            SEQVL: row[41],
            BRAND: row[42],
            MONTH: row[3].getMonth() + 1,
            YEAR: row[3].getFullYear(),
          };
          newData.push(obj);
        }, {});
        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await slaViewSchema.aggregate([
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

          console.log(exisitingData.length, "exisiting document");

          // if (exisitingData.length == 0) {
          console.log("insert document");
          let insertQuery = await slaViewSchema.insertMany(newData);
          // } else {
          //   console.log("update query");
          //   newData.forEach(async (obj1) => {
          //     const obj2 = exisitingData.find(
          //       (item) => item.VENDOR === obj1.VENDOR
          //     );

          //     if (obj2) {
          //       const hasChanges =
          //         JSON.stringify(obj1) !== JSON.stringify(obj2);
          //       if (hasChanges) {
          //         await suppViewSchema.updateOne(
          //           { VENDOR: obj1.VENDOR },
          //           { $set: obj1 }
          //         );
          //       } else {
          //       }
          //       //     if (obj1 == obj2) {
          //       //     } else {

          //       // console.log("update query+++++++++",obj1,obj2);

          //       //       await suppViewSchema.updateOne(
          //       //         { VENDOR: obj1.VENDOR },
          //       //         { $set: obj1 }
          //       //       );
          //       //     }
          //     } else {
          //       console.log("update query______", obj1);

          //       await suppViewSchema.create(obj1);
          //     }
          //   });
          // }
        }
      }
    };
  } catch (error) {
    console.error("Error connecting to Oracle:", error);
  }
}
run();

//end
