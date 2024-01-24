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

const service = require("./service/Viewreports-service");
const { log } = require("util");

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

//oracle db connection
const dbConfig = {
  // user: config.USERNAME,
  // password: config.PASSWORD,
  // connectString: config.CONNECTION_STRING,
  user: "VENDORPORTAL",
  password: "VENDORPORTAL",
  connectString: "192.168.14.237:1521/ESTK",
  poolMax: 10, // Maximum number of connections in the pool
  poolMin: 2, // Minimum number of connections in the pool
  poolIncrement: 2, // Number of connections to add when needed
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

      db.on("error", console.error.bind("MongoDB connection error:"));
      db.once("open", () => {
        //cron job setup
        // Schedule the task to run at 10 AM and 11 PM every day
        // cron.schedule("* * * * *", scheduledFunction);
        
        cron.schedule("45 7,19 * * *", poFunction);
        cron.schedule("53 7,19 * * *", poDetailFunction);
        cron.schedule("56 7,19 * * *", poFooterFunction);
        //grn
        // 6
        cron.schedule("59 7,20 * * *", grnFunction);
        cron.schedule("5 8,20 * * *", grnDetailFunction);
        cron.schedule("15 8,20 * * *", grnFooterFunction);
        
        cron.schedule("10 10,22 * * *", scheduledFunction);
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

    // poFunction

    const poFunction = async () => {
      console.log("inside the po function",new Date());
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
            supp_No: row[6],
            comm_Contract: row[7],
            adress_chain_supp: row[8],
            po_Comments: row[9],
            po_Date: row[10],
            delivery_Date: row[11],
            delivery_Deadline: row[12],
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
    };
    const poDetailFunction = async () => {
      console.log("inside the detailpo function",new Date());

      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_PO_Detail_View"
      );
      console.log(result.rows.length, "____________");

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
      console.log("inside the footer function",new Date());

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

    const grnFunction = async () => {
      console.log("grn headre view",new Date());
      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_GRN_Header_View"
      );
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the grn", result.rows.length);

      if (result.rows) {
        console.log("inside the grn", result.rows.length);
        const jsonObject = result.rows.reduce((acc, row) => {
          let obj = {
            SITE: row[0],
            Site_Name: row[1],
            Po_No: row[2],
            Po_Date: row[3],
            Supp_No: row[4],
            Addr_Chain: row[5],
            CC: row[6],
            // glob_order: row[7],
            Grn_No: row[7],
            Grn_Dt: row[8],
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
            Dt_Cre: row[45],
            Dt_Mod: row[46],
          };
          newData.push(obj);
        }, {});
        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await grnHeaderViewSchema.aggregate([
            { $match: {} },
            {
              $project: {
                _id: 0,
                createdAt: 0,
                updatedAt: 0,
              },
            },
          ]);

          console.log(exisitingData.length, "+++++");

          if (exisitingData.length == 0) {
            console.log("log ger her for insert document");
            let insertQuery = await grnHeaderViewSchema.insertMany(newData);
          } else {
            console.log("update query");
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.Po_No === obj1.Po_No
              );

              if (obj2) {
                if (obj1 == obj2) {
                } else {
                  await grnHeaderViewSchema.updateOne(
                    { Po_No: obj1.Po_No },
                    { $set: obj1 }
                  );
                }
              } else {
                await grnHeaderViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };
    const grnDetailFunction = async () => {
      console.log("grn detail view",new Date());
      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_GRN_Detail_View"
      );
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the grn", result.rows.length);

      if (result.rows) {
        console.log("inside the grn", result.rows.length);
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
        if (newData.length > 0) {
          //fetch mongodb datas

          let exisitingData = await grnDetailViewSchema.aggregate([
            { $match: {} },
            {
              $project: {
                _id: 0,
                createdAt: 0,
                updatedAt: 0,
              },
            },
          ]);

          console.log(exisitingData.length, "+++++");

          if (exisitingData.length == 0) {
            console.log("log ger her for insert document");
            let insertQuery = await grnDetailViewSchema.insertMany(newData);
          } else {
            console.log("update query");
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.Po_No === obj1.Po_No
              );

              if (obj2) {
                if (obj1 == obj2) {
                } else {
                  await grnDetailViewSchema.updateOne(
                    { Po_No: obj1.Po_No },
                    { $set: obj1 }
                  );
                }
              } else {
                await grnDetailViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };
    const grnFooterFunction = async () => {
      console.log("grn detail view",new Date());
      let newData = [];
      //fetch oracle db data and insert those datas into mongodb
      const result = await connection.execute(
        "select * from SPAR_GRN_Footer_View"
      );
      // await connection.close(); // Release the connection back to the pool
      console.log("inside the grn footer", result.rows.length);

      if (result.rows) {
        console.log("inside the grn footer", result.rows.length);
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
              },
            },
          ]);

          console.log(exisitingData.length, "+++++");

          if (exisitingData.length == 0) {
            console.log("log ger her for insert document");
            let insertQuery = await grnFooterViewSchema.insertMany(newData);
          } else {
            console.log("update query");
            newData.forEach(async (obj1) => {
              const obj2 = exisitingData.find(
                (item) => item.Po_No === obj1.Po_No
              );

              if (obj2) {
                if (obj1 == obj2) {
                } else {
                  await grnFooterViewSchema.updateOne(
                    { Po_No: obj1.Po_No },
                    { $set: obj1 }
                  );
                }
              } else {
                await grnFooterViewSchema.create(obj1);
              }
            });
          }
        }
      }
    };

    // grnFooterFunction
    const grnFooterrFunction = async () => {
      console.log("inside the footer function");

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
  } catch (error) {
    console.error("Error connecting to Oracle:", error);
  }
}
run();

//end
