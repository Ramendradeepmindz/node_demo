import adminModel from "../Models/Admin/AdminDetails.js";
import jwt from "jsonwebtoken";
import Helper from "../Helper/helper_response.js";

class AuthMiddlewares {
  static adminToken = async (req, res, next) => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        return Helper.response(res, 401, "You must be logged in");
      }

      const token = authorization;

      const payload = jwt.verify(token, process.env.JSON_WEC_KEY);

      if (!payload || !payload.userId) {
        return Helper.response(res, 401, "Token is invalid");
      }

      const userdata = await adminModel.findById(payload.userId).lean();

      if (!userdata) {
        return Helper.response(res, 401, "Token is invalid");
      }

     else if (!userdata.token || userdata.token.includes(token)) {
        return Helper.response(res, 401, "Token is invalid");
      }

      req.user = userdata;

      next();
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return Helper.response(res, 401, "Token is invalid or expired");
      }

      console.error("Auth Middleware Error:", err);
      return Helper.response(res, 500, "Internal Server Error");
    }
  };
}

export default AuthMiddlewares;
