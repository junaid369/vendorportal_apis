module.exports = function (app, db) {
  require("./controlller/Viewreports")(app, db);
  require("./controlller/admin")(app, db);
};
