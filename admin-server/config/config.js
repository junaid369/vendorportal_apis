require("dotenv").config();

module.exports = {
  uaeTime: function uaeTime(time) {
    
    return new Date(new Date(time).setHours(new Date(time).getHours() + 3));
  },

  dateOnlyInUTC: new Date(
    Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    )
  ),
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
