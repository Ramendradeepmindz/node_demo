import AdminDetails from "../../Models/Admin/AdminDetails.js";
import PartnerDetails from "../../Models/Admin/PartnerDetails.js";
import Category from "../../Models/Admin/Category.js";

import bcrypt from "bcrypt";
import validation from "../../Validation/validator.js";
import jwt from "jsonwebtoken";
import UtilText from "../../Helper/messageHelper.js";
import ResponseHelper from "../../Helper/helper_response.js";

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const upload = multer({ dest: "uploads/" });
class AdminController {
  static adminRegistration = async (req, res) => {
    const { name, email, password, phoneNo } = req.body;
    const Message = {
      name: validation.validateName(name),
      email: validation.validateEmail(email),
      password: validation.validatePassword(password),
      phoneNo: validation.validatePhoneNo(phoneNo),
    };

    // Filter out null values (no Message)
    const filteredMessage = Object.fromEntries(
      Object.entries(Message).filter(([_, value]) => value !== null)
    );

    if (Object.keys(filteredMessage).length > 0) {
      return res.status(400).json({
        StatusCode: 400,
        Status: "Error",
        Message: filteredMessage,
      });
    } else {
      const adminUser = await AdminDetails.findOne({ email: email });
      if (adminUser) {
        return res.status(201).send({
          StatusCode: 201,
          Message: UtilText.emailAlreadyRegister,
        });
      } else {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          const doc = new AdminDetails({
            email: email,
            name: name,
            password: hashedPassword,
            phoneNo: phoneNo,
          });

          await doc.save();
          return res.status(200).send({
            StatusCode: 200,
            Message: UtilText.registerSuccess,
          });
        } catch (error) {
          return res.status(500).send({
            StatusCode: 500,
            Message: UtilText.UnableRegister,
          });
        }
      }
    }
  };

  static adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const Message = {
        email: validation.validateEmail(email),
        password: validation.validatePassword(password),
      };

      // Filter out null values (no Message)
      const filteredMessage = Object.fromEntries(
        Object.entries(Message).filter(([_, value]) => value !== null)
      );

      if (Object.keys(filteredMessage).length > 0) {
        return res.status(203).json({
          StatusCode: 203,
          Status: "Failed",
          Message: filteredMessage,
        });
      } else {
        const adminUser = await AdminDetails.findOne({ email: email });
        if (adminUser != null) {
          const isMatched = await bcrypt.compare(password, adminUser.password);
          if (email == adminUser.email && isMatched) {
            const token = jwt.sign(
              { userId: adminUser._id },
              process.env.JSON_WEC_KEY,
              { expiresIn: "20d" }
            );

            await AdminDetails.updateOne(
              { _id: adminUser._id },
              { token: token, status: true }
            );
            const adminUserData = await AdminDetails.findById({
              _id: adminUser._id,
            });

            adminUserData.password = undefined;

            res.status(200).json({
              StatusCode: 200,
              Status: "Success",
              Message: UtilText.LoginSuccess,
              data: adminUserData,
            });
          } else {
            res.status(203).json({
              StatusCode: 203,
              Status: "failed",
              Message: UtilText.InvalidEmailPassword,
            });
          }
        } else {
          return res.status(404).json({
            StatusCode: 404,
            Status: "Failed",
            Message: UtilText.UserNotFound,
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        StatusCode: 400,
        Status: "Error",
        Message: error,
      });
    }
  };
  static resetPassword = async (req, res) => {
    try {
      const { oldPassword, newPassword, id } = req.body;
      const Message = {
        oldPassword: validation.validatePassword(oldPassword),
        newPassword: validation.validatePassword(newPassword),
      };

      // Filter out null values (no Message)
      const filteredMessage = Object.fromEntries(
        Object.entries(Message).filter(([_, value]) => value !== null)
      );

      if (Object.keys(filteredMessage).length > 0) {
        return res.status(203).json({
          StatusCode: 203,
          Status: "Failed",
          Message: filteredMessage,
        });
      } else {
        const adminUser = await AdminDetails.findOne({ _id: id });

        if (adminUser != null) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
          const adminUserUpdate = await AdminDetails.updateOne(
            { _id: adminUser._id },
            { password: hashedPassword }
          );
          //   adminUser.password = undefined;

          res.status(200).json({
            StatusCode: 200,
            Status: "Success",
            Message: UtilText.ResetPasswordSuccess,
          });
        } else {
          return res.status(404).json({
            StatusCode: 404,
            Status: "Failed",
            Message: UtilText.UserNotFound,
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        StatusCode: 400,
        Status: "Error",
        Message: error,
      });
    }
  };

  static forgotPassword = async (req, res) => {
    try {
      const { email, password } = req.body;
      const Message = {
        email: validation.validatePassword(email),
        password: validation.validatePassword(password),
      };

      // Filter out null values (no Message)
      const filteredMessage = Object.fromEntries(
        Object.entries(Message).filter(([_, value]) => value !== null)
      );

      if (Object.keys(filteredMessage).length > 0) {
        return res.status(203).json({
          StatusCode: 203,
          Status: "Failed",
          Message: filteredMessage,
        });
      } else {
        const adminUser = await AdminDetails.findOne({ email: email });

        if (adminUser != null) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          const adminUserUpdate = await AdminDetails.updateOne(
            { email: adminUser.email },
            { password: hashedPassword }
          );
          //   adminUser.password = undefined;

          res.status(200).json({
            StatusCode: 200,
            Status: "Success",
            Message: UtilText.registerSuccess,
          });
        } else {
          return res.status(404).json({
            StatusCode: 404,
            Status: "Failed",
            Message: UtilText.UserNotFound,
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        StatusCode: 400,
        Status: "Error",
        Message: error,
      });
    }
  };

  static logout = async (req, res) => {
    try {
      var { _id } = req.user._id;

      await AdminDetails.updateOne({ _id: _id }, { token: "", status: false });
      return res.status(404).json({
        StatusCode: 404,
        Status: "Success",
        Message: UtilText.LogoutSuccess,
      });
    } catch (error) {
      return Helper.response(res, 500, "Server error.");
    }
  };

  static getProfile = async (req, res) => {
    try {
      const { id } = req.user._id;

      const adminUser = await AdminDetails.findById({ _id: req.user._id });

      if (adminUser != null) {
        //   adminUser.password = undefined;
        adminUser.password = undefined;

        res.status(200).json({
          StatusCode: 200,
          Status: "Success",
          Message: UtilText.Details,
          UserData: adminUser,
        });
      } else {
        return res.status(404).json({
          StatusCode: 404,
          Status: "Failed",

          Message: UtilText.UserNotFound,
        });
      }
    } catch (error) {
      return res.status(400).json({
        StatusCode: 400,
        Status: "Error",
        Message: error,
      });
    }
  };
  static editProfile = async (req, res) => {
    try {
      const { id } = req.user._id;
      const { name, emailID, phoneNo } = req.body;

      const Message = {
        name: validation.validateName(name),
        email: validation.validateEmail(emailID),

        phoneNo: validation.validatePhoneNo(phoneNo),
      };

      // Filter out null values (no Message)
      const filteredMessage = Object.fromEntries(
        Object.entries(Message).filter(([_, value]) => value !== null)
      );

      if (Object.keys(filteredMessage).length > 0) {
        return res.status(400).json({
          StatusCode: 400,
          Status: "Error",
          Message: filteredMessage,
        });
      } else {
        const adminUser = await AdminDetails.findByIdAndUpdate(
          { _id: req.user._id },

          {
            name: name,
            email: emailID,
            phoneNo: phoneNo,
          }
        );

        if (adminUser != null) {
          return res.status(404).json({
            StatusCode: 404,
            Status: "Success",

            Message: "User Details update success",
          });
        } else {
          return res.status(404).json({
            StatusCode: 404,
            Status: "Failed",

            Message: UtilText.UserNotFound,
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        StatusCode: 400,
        Status: "Error",
        Message: error,
      });
    }
  };

  static uploadImage = async (req, res) => {
    cloudinary.config({
      cloud_name: "dd0sva6po",
      api_key: "592728797625274",
      api_secret: "iL1wP3DZxvNFvR1ptq4AKFSP6G8", // Click 'View API Keys' above to copy your API secret
    });

    const filePath = req.file.path;
    const data = await cloudinary.uploader.upload(filePath, {
      folder: "Assets",
    });

    if (data.type === "upload") {
      await AdminDetails.updateOne(
        { _id: req.user._id },
        { profileImg: data.secure_url }
      );
      return res.status(200).json({
        StatusCode: 200,
        Status: "Success",
        Message: "Upload successful",
      });
    } else {
      res.json({ message: "Image Upload  Failed", url: data });
    }
  };

  static addPartner = async (req, res) => {
    const { EmailID, GSTNo, adharaCard, panCard } = req.body;
    const existingPartner = await PartnerDetails.findOne({
      $or: [{ EmailID }, { GSTNo }, { adharaCard }, { panCard }],
    });

    if (existingPartner) {
      let errorMessage = "";

      if (existingPartner.EmailID === EmailID) {
        errorMessage = "Email is already registered.";
      } else if (existingPartner.GSTNo === GSTNo) {
        errorMessage = "GST Number is already registered.";
      } else if (existingPartner.adharaCard === adharaCard) {
        errorMessage = "Aadhaar Card number is already registered.";
      } else if (existingPartner.panCard === panCard) {
        errorMessage = "PAN Card number is already registered.";
      }

      return ResponseHelper.error(res, 209, errorMessage);
    } else {
      try {
        const partnerData = new PartnerDetails(req.body);

        const addedData = await partnerData.save();
        return ResponseHelper.success(
          res,
          200,
          UtilText.UserAddedSuccess,
          addedData
        );
      } catch (error) {
        return ResponseHelper.error(res, 400, UtilText.UnableRegister);
      }
    }
  };
  static getAllPartner = async (req, res) => {
    try {
      const partner = await PartnerDetails.find();

      if (partner != null) {
        //   adminUser.password = undefined;

        return ResponseHelper.success(res, 200, UtilText.Details, partner);
      } else {
        return ResponseHelper.error(res, 209, UtilText.DetailsNotFound);
      }
    } catch (error) {
      return ResponseHelper.error(res, 404, UtilText.DetailsNotFound);
    }
  };
  static partnerStatusChange = async (req, res) => {
    const { status, id } = req.body;

    try {
      const partnerExist = await PartnerDetails.findById({ _id: id });
      if (!partnerExist) {
        return ResponseHelper.error(res, 209, UtilText.DetailsNotFound);
      } else {
        await PartnerDetails.findByIdAndUpdate(
          { _id: id },
          { shopOpenStatus: status }
        );
        return ResponseHelper.success(res, 200, UtilText.PartnerStatusChange);
      }
    } catch (error) {
      return ResponseHelper.error(res, 209, error);
    }
  };

  static addCategory = async (req, res) => {
    const filePath = req.file.path;
    const Cat_Name = req.body.Cat_Name;

    const existingCategory = await Category.findOne({
      $or: [{ Cat_Name }],
    });

    if (existingCategory) {
      let errorMessage = "";

      if (existingCategory.Cat_Name === Cat_Name) {
        errorMessage = "Category is already registered.";
      }
      return ResponseHelper.error(res, 209, errorMessage);
    } else {
      try {
        cloudinary.config({
          cloud_name: "dd0sva6po",
          api_key: "592728797625274",
          api_secret: "iL1wP3DZxvNFvR1ptq4AKFSP6G8", // Click 'View API Keys' above to copy your API secret
        });

        const data = await cloudinary.uploader.upload(filePath, {
          folder: "CategoryImage",
        });

        // .then(result => {

        if (data.type === "upload") {
          const categoryData = new Category({
            Cat_Name: Cat_Name,
            Cat_Image: data.secure_url,
          });

          const addedData = await categoryData.save();
          return ResponseHelper.success(
            res,
            200,
            UtilText.CategoryAddedSuccess,
            addedData
          );
        }
      } catch (error) {
        return ResponseHelper.error(res, 400, UtilText.UnableRegister);
      }
    }
  };
  static categoryListData = async (req, res) => {
    try {
      const categoryData = await Category.find();

      if (categoryData != null) {
        //   adminUser.password = undefined;

        return ResponseHelper.success(res, 200, UtilText.Details, categoryData);
      } else {
        return ResponseHelper.error(res, 209, UtilText.DetailsNotFound);
      }
    } catch (error) {
      return ResponseHelper.error(res, 404, UtilText.DetailsNotFound);
    }
  };

  static updateCategoryByName = async (req, res) => {
    try {
      const { Cat_Name, id } = req.body;

      if (Cat_Name != "" && id != "") {
        const categoryData = await Category.findByIdAndUpdate(
          id,
          { Cat_Name: Cat_Name },
          { new: true }
        );

        if (categoryData != null) {
          return ResponseHelper.success(
            res,
            200,
            "Category Update successfully"
          );
        } else {
          return ResponseHelper.error(res, 209, UtilText.DetailsNotFound);
        }
      } else {
        return ResponseHelper.error(
          res,
          209,
          "Category name and ID is required!"
        );
      }
    } catch (error) {
      return ResponseHelper.error(res, 404, UtilText.DetailsNotFound);
    }
  };

  static categoryStatusChange = async (req, res) => {
    const { status, id } = req.body;

    try {
      const categoryData = await Category.findByIdAndUpdate(
        id,
        { Cat_Status: status },
        { new: true }
      );
      if (!categoryData) {
        return ResponseHelper.error(res, 209, UtilText.DetailsNotFound);
      } else {
        return ResponseHelper.success(res, 200, UtilText.CategoryStatusChange);
      }
    } catch (error) {
      return ResponseHelper.error(res, 209, error);
    }
  };
  static updateCategoryImage = async (req, res) => {
    const filePath = req.file.path;
    const Cat_ID = req.body.Cat_ID;

    try {
      cloudinary.config({
        cloud_name: "dd0sva6po",
        api_key: "592728797625274",
        api_secret: "iL1wP3DZxvNFvR1ptq4AKFSP6G8", // Click 'View API Keys' above to copy your API secret
      });

      const data = await cloudinary.uploader.upload(filePath, {
        folder: "CategoryImage",
      });

  

      if (data.type === "upload") {
        const categoryData = await Category.findByIdAndUpdate(
          Cat_ID.trim(),
          { Cat_Image: data.secure_url },
          { new: true }
        );

        return ResponseHelper.success(res, 200, UtilText.CategoryStatusChange);
      }
    } catch (error) {
      return ResponseHelper.error(res, 400, UtilText.UnableRegister);
    }
  };
}

export default AdminController;

// 200	OK	OK
// 201	CREATED	Created
// 202	ACCEPTED	Accepted
// 203	NON_AUTHORITATIVE_INFORMATION	Non Authoritative Information
// 204	NO_CONTENT	No Content
// 205	RESET_CONTENT	Reset Content
// 206	PARTIAL_CONTENT	Partial Content
// 207	MULTI_STATUS	Multi-Status

/* 

01) RegisterAdmin
02) Login
03) Reset Password
04) Forgot Password, 
05) Edit Profile ,
06) Upload Profile Image,
07) Get  Profile Data
08) Logout
09) Add Partner (Name, Email ID,Phone NO, Aadhar Card,GST NO.,Address )
10) Edit Partner
11) Partner List
12) Disable  Partner
13) Add Category
14) Edit Category
15) Category List
16) Hide Category
17)
//



*****************Add Category************************
Cat_Name,
Cat_Image,
Cat_Status,
Cat_Date,































*/
