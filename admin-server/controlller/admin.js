module.exports = (app, db) => {
  let common = require("../global/common");
  const VIEW_MODEL = require("../service/admin-service");
  const arrayEmpty = [];

  //add admin modules
  app.post("/v2/api/admin/add_admin_modules", (req, res) => {
    try {
      let obj = req.body;

      if (!obj) {
        res.status(200).json({
          success: false,
          message: "Requst is missing.",
          data: arrayEmpty,
        });
      } else {
        VIEW_MODEL.funAddAdminModules(obj, db)
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              message: "Internal server error.",
              data: arrayEmpty,
            });
          });
      }
    } catch (error) {}
  });
  app.post("/v2/api/admin/update_admin_modules", (req, res) => {
    try {
      let obj = req.body;

      if (!obj) {
        res.status(200).json({
          success: false,
          message: "Requst is missing.",
          data: arrayEmpty,
        });
      } else {
        VIEW_MODEL.funUpdateAdminModules(obj, db)
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              message: "Internal server error.",
              data: arrayEmpty,
            });
          });
      }
    } catch (error) {}
  });
  app.post("/v2/api/admin/delete_admin_modules", (req, res) => {
    try {
      let obj = req.body;

      if (!obj) {
        res.status(200).json({
          success: false,
          message: "Requst is missing.",
          data: arrayEmpty,
        });
      } else {
        VIEW_MODEL.funDeleteAdminModules(obj, db)
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              message: "Internal server error.",
              data: arrayEmpty,
            });
          });
      }
    } catch (error) {}
  });
  app.post("/v2/api/admin/get_admin_modules", (req, res) => {
    try {
      let obj = req.body;

      if (!obj) {
        res.status(200).json({
          success: false,
          message: "Requst is missing.",
          data: arrayEmpty,
        });
      } else {
        VIEW_MODEL.funGetAdminModules(obj, db)
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              message: "Internal server error.",
              data: arrayEmpty,
            });
          });
      }
    } catch (error) {}
  });

  //admin login
  app.post("/v2/api/admin/admin_login", (req, res) => {
    try {
      let obj = req.body;

      if (!obj) {
        res.status(200).json({
          success: false,
          message: "Requst is missing.",
          data: arrayEmpty,
        });
      } else {
        VIEW_MODEL.funGetAdminLogin(obj, db)
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              message: "Internal server error.",
              data: arrayEmpty,
            });
          });
      }
    } catch (error) {}
  });
  app.post("/v2/api/admin/admin_login_requst", (req, res) => {
    try {
      let obj = req.body;

      if (!obj) {
        res.status(200).json({
          success: false,
          message: "Requst is missing.",
          data: arrayEmpty,
        });
      } else {
        VIEW_MODEL.funAdminLoginrequst(obj, db)
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              message: "Internal server error.",
              data: arrayEmpty,
            });
          });
      }
    } catch (error) {}
  });
  //admin confirm
  app.post(
    "/v2/api/admin/admin_requst_approve",
    common.verifyToken,
    (req, res) => {
      try {
        let obj = req.body;

        if (!obj) {
          res.status(200).json({
            success: false,
            message: "Requst is missing.",
            data: arrayEmpty,
          });
        } else {
          VIEW_MODEL.funAdminApprove(obj, db)
            .then((result) => {
              res.status(200).json(result);
            })
            .catch((error) => {
              res.status(400).json({
                success: false,
                message: "Internal server error.",
                data: arrayEmpty,
              });
            });
        }
      } catch (error) {}
    }
  );

  //login requst view
  app.post(
    "/v2/api/admin/login_request_view",
    common.verifyToken,
    (req, res) => {
      try {
        let obj = req.body;

        if (!obj) {
          res.status(200).json({
            success: false,
            message: "Requst is missing.",
            data: arrayEmpty,
          });
        } else {
          VIEW_MODEL.funLoginrequstView(obj, db)
            .then((result) => {
              res.status(200).json(result);
            })
            .catch((error) => {
              res.status(400).json({
                success: false,
                message: "Internal server error.",
                data: arrayEmpty,
              });
            });
        }
      } catch (error) {}
    }
  );
  // all admins view
  app.post("/v2/api/admin/get_all_admins", common.verifyToken, (req, res) => {
    try {
      let obj = req.body;

      if (!obj) {
        res.status(200).json({
          success: false,
          message: "Requst is missing.",
          data: arrayEmpty,
        });
      } else {
        VIEW_MODEL.funGetAllAdmins(obj, db)
          .then((result) => {
            res.status(200).json(result);
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              message: "Internal server error.",
              data: arrayEmpty,
            });
          });
      }
    } catch (error) {}
  });
};
