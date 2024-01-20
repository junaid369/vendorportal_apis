let config = require("../config/config");
let jwt = require("jsonwebtoken");
const bcrypt = require("crypto");

let arryEmpty = [];

module.exports = {
  // return password salt and hash

  setPassword: function (password) {
    // let salt = bcrypt.randomBytes(16).toString("hex"); //generate random salt
    let salt = "99"; //generate random salt
    let hashedPassword = bcrypt
      .pbkdf2Sync(password, salt, 1000, 64, "sha1")
      .toString("hex");
    return hashedPassword;
  },
  // validate password with exsisting
  // validPassword: async function (inputPassword, hashedPassword) {
  //   const match = await bcrypt.compare(inputPassword, hashedPassword);
  //   return match;
  // },

  validPassword: function (inputPassword) {
    let hash = bcrypt
      .pbkdf2Sync(inputPassword, "99", 1000, 64, "sha1")
      .toString("hex");
      console.log(hash);
    return hash;

    // const hashedInputPassword = hashPassword(inputPassword, doc.strPrePassword);
    // return hashedInputPassword === storedHashedPassword;
  },

  verifyToken: (req, res, next) => {
    try {
      const bearerHeader = req.headers["authorization"];
      if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        req.token = bearer[1]; // Attach token to request.
        jwt.verify(req.token, config.JWT_SECRET, (err, decoded) => {
          // decoded value s // console.log('decoded', decoded.user);
          if (err) {
            return res.status(401).json({
              success: false,
              message: "Token Error",
              data: err,
            });
          } // Attach decoded user details to request.
          if (!decoded) {
            return res.status(401).end();
          } else {
            req.user = decoded.user;
            next();
          }
        });
      } else {
        return res.json({
          success: false,
          message: "Header Authorization Error",
          data: "Header Authorization Error",
        });
      }
    } catch (e) {
      res.status(500).json({
        success: false,
        message: "Error: No authorization header present ::" + e,
        data: [],
      });
    }
  },
  isEmptyObject: (obj) => {
    return !Object.keys(obj).length;
  },
};
