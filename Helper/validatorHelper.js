import { body, validationResult } from "express-validator";

class ValidatorHelper {
  // Static method for partner validation
  static validatePartner() {
    return [
      body("Name")
        .notEmpty()
        .withMessage("Name is required")
        .isString()
        .withMessage("Name must be a string"),

      body("phoneNo")
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone()
        .withMessage("Phone number must be valid"),

      body("EmailID")
        .notEmpty()
        .withMessage("Email ID is required")
        .isEmail()
        .withMessage("Email ID must be valid"),

      body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "user", "partner"])
        .withMessage("Role must be one of admin, user, or partner"),

      body("panCard")
        .notEmpty()
        .withMessage("PAN Card is required")
        .matches(/^([A-Z]{5}[0-9]{4}[A-Z]{1})$/)
        .withMessage("PAN Card format is invalid"),

      body("adharaCard")
        .notEmpty()
        .withMessage("Adhara Card is required")
        .matches(/^\d{12}$/)
        .withMessage("Adhara Card must be a 12-digit number"),

      body("GSTNo")
        .notEmpty()
        .withMessage("GST Number is required")
        .matches(/^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})$/)
        .withMessage("GST Number format is invalid"),

      // Middleware to handle validation errors
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(203).json({
            StatusCode: 203,
            Status: "Non-Authoritative Information",
            Message: errors.array(),
          });
        }
        next();
      },
    ];
  }
  
  static statusChangePartner() {
    return [
      // Validate 'status'
      body("status")
      .isString()
      .notEmpty()
      .withMessage("Status must be a boolean value (true or false)."),

      // Validate 'partnerID'
      body("partnerID")
        .notEmpty()
        .withMessage("Partner ID is required")
       // Use isUUID or a proper validation for your partnerID format
        ,

      // Middleware to handle validation errors
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({
            StatusCode: 422,
            Status: "Validation Error",
            Message: errors.array(),
          });
        }
        next();
      },
    ];
  }
}

export default ValidatorHelper;
