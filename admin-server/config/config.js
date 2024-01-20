require("dotenv").config();

module.exports = {
  //Live  DB
  DATABASE_NAME: process.env.DATABASE_NAME,
  CONNECTION_URL: process.env.CONNECTION_URL,
  PORT: process.env.PORT,
  //oracle credntioals
  USERNAME: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  CONNECTION_STRING: process.env.CONNECTION_STRING,
  SPAR_SITES_VIEW: process.env.SPAR_SITES_VIEW,
  JWT_SECRET: process.env.JWT_SECRET,
};
