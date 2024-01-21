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
const poDetailViewSchema = require("./models/po_Detail_view-model");
const poFooterViewSchema = require("./models/po_footer-modal");

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
        cron.schedule("0 10,22 * * *", scheduledFunction);
        cron.schedule("0 7,19 * * *", poFunction);
        cron.schedule("5 7,19 * * *", poDetailFunction);
        cron.schedule("6 7,19 * * *", poFooterFunction);

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
      console.log("function inside sites view+++++++++++");
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
      console.log("inside the po function");
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
      console.log("inside the detailpo function");

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
