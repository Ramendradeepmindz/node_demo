import adminModel from "../Models/Admin/AdminDetails.js";
import jwt from "jsonwebtoken";
import ResponseHelper from "../Helper/helper_response.js";
import UtilText from "../Helper/messageHelper.js";
const JWT_SECRET = process.env.JSON_WEC_KEY
class AuthMiddlewares {
  static adminToken = async (req, res, next) => {

    const { authorization } = req.headers
            // console.log(authorization)
        if (!authorization) {
            return ResponseHelper.error(res, 401, UtilText.TokenNotFound);
        }
        const token = authorization
        jwt.verify(token, process.env.JSON_WEC_KEY, (err, payload) => {
            // console.log(payload)
            // return false;
            if (err) {
                // return Helper.response(res, 401, "you must be logged in");
                return ResponseHelper.error(res, 401, "you must be logged in");
            }
            const { _id } = payload.userId
            adminModel.findById(payload.userId).lean().then(userdata => {
                if (userdata == null ||userdata.token=="") {
                    return ResponseHelper.error(res, 401, "Token is invalid");
                }
                //if(token == userdata.JWT_Token){
                else if (userdata.token.includes(token)) {
                    userdata.token = token;
                    req.user = userdata
         
                    next()
                } else {
                    return ResponseHelper.error(res, 401, "Token is invalid");
                }
            })

        })

    
  };
}

export default AuthMiddlewares;
