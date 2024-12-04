class ResponseHelper {
    // Static method for partner validation
 // responseHelper.js

  static  success= (res, statusCode, message, data = [])=> {
      return res.status(statusCode).json({
        StatusCode: statusCode,
        Status: "Success",
        Message: message,
        Data: data,
      });
    }
  
  static  error= (res, statusCode, message) => {
      return res.status(statusCode).json({
        StatusCode: statusCode,
        Status: "Error",
        Message: message,
      });
    }
  
 static   conflict= (res, message) => {
      return res.status(409).json({
        StatusCode: 409,
        Status: "Conflict",
        Message: message,
      });
    }
  
   static internalError= (res, message) => {
      return res.status(500).json({
        StatusCode: 500,
        Status: "Error",
        Message: message,
      });
    }
  
  
  }
  
  export default ResponseHelper;