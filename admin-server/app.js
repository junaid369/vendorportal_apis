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
  user: config.USERNAME,
  password: config.PASSWORD,
  connectString: config.CONNECTION_STRING,
  // user: "VENDORPORTAL",
  // password: "VENDORPORTAL",
  // connectString: "192.168.14.237:1521/ESTK",
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
        // cron.schedule("0 10,23 * * *", scheduledFunction);
        // cron.schedule("* * * * *", scheduledFunction);

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
    // const scheduledFunction = async () => {
    //   let newData = [];
    //   //fetch oracle db data and insert those datas into mongodb
    //   const result = await connection.execute("select * from SPAR_SITES_VIEW");
    //   await connection.close(); // Release the connection back to the pool
    //   if (result.rows) {
    //     const jsonObject = result.rows.reduce((acc, row) => {
    //       let obj = {
    //         siteCode: row[0],
    //         siteName: row[1],
    //         steCls: row[2],
    //         siteClass: row[3],
    //         siteGroup: row[4],
    //       };
    //       newData.push(obj);
    //     }, {});

    //     if (newData.length > 0) {
    //       //fetch mongodb datas

    //       let exisitingData = await sitesViewSchema.aggregate([
    //         { $match: {} },
    //         {
    //           $project: {
    //             siteCode: 1,
    //             siteName: 1,
    //             steCls: 1,
    //             siteClass: 1,
    //             siteGroup: 1,
    //             _id: 0,
    //           },
    //         },
    //       ]);

    //       if (exisitingData.length == 0) {
    //         let insertQuery = await sitesViewSchema.insertMany(newData);
    //       } else {
    //         newData.forEach(async (obj1) => {
    //           const obj2 = exisitingData.find(
    //             (item) => item.siteCode === obj1.siteCode
    //           );

    //           if (obj2) {
    //             if (obj1 == obj2) {
    //             } else {
    //               await sitesViewSchema.updateOne(
    //                 { siteCode: obj1.siteCode },
    //                 { $set: obj1 }
    //               );
    //             }
    //           } else {
    //             await sitesViewSchema.create(obj1);
    //           }
    //         });
    //       }
    //     }
    //   }
    // };
  } catch (error) {
    console.error("Error connecting to Oracle:", error);
  }
}
run();

//end

// mongoose.connect(process.env.CONNECTION_URL, {
//   // Other options can be added here based on your requirements
// });

// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", () => {
//   console.log("Connected to MongoDB");

//   //   require("./admin_routes")(app, db);
//   app.use(express.static(path.join(__dirname, "dist")));
//   // Catch all other routes and return the index file
//   app.get("*", function (req, res) {
//     res.sendFile(path.join(__dirname, "dist/index.html"));
//   });
//   // Initialize the app
//   let server = app.listen(process.env.PORT || 3001, function () {
//     let port = server.address().port;
//     console.log("App now running on http://localhost", +port);
//   });
// });

// const result = await connection.execute("SELECT * FROM SPAR_SITES_VIEW");
// Release the connection

// Convert the result into a JSON object
// let newData = [];
// const jsonObject = result.rows.reduce((acc, row) => {
//   console.log(row);
//   let obj = {
//     number: row[0],
//     name: row[1],
//     id: row[2],
//     site: row[3],
//     group: row[4],
//   };
//   console.log(obj);
//   newData.push(obj);
// }, {});

// await connection.close();
