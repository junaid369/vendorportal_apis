// const config = require("../config/config");
// const common = require("../global/common");
const sitesViewSchema = require("../models/sites_view-model");
const poViewSchema = require("../models/po_view-model");
const poDetailViewSchema = require("../models/po_Detail_view-model");
const poFooterViewSchema = require("../models/po_footer-modal");

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
};
