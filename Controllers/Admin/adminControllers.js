import AdminDetails from "../../Models/Admin/AdminDetails.js";
import bcrypt from "bcrypt";
import validation from "../../Validation/validator.js";
import jwt from "jsonwebtoken";
import UtilText from "../../Helper/messageHelper.js";
import express from "express";
import mongoose from "mongoose";

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

    // .then(result => {

    if (data.type === "upload") {
      await AdminDetails.updateOne(
        { _id: req.user._id },
        { profileImg: data.secure_url }
      );
      return res.status(404).json({
        StatusCode: 404,
        Status: "Success",
        Message: "Upload successful",
      });

      // res.json({ message: "Upload successful", url: data.secure_url });
    } else {
      res.json({ message: "Image Upload  Failed", url: data });
    }
    // })
    // .catch(error => {
    //   res.status(500).json({ message: 'Upload failed', error: error });
    // });
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
09) Add Partner
10) Edit Partner
11) Partner List
12) Disable  Partner
13) Add Category
14) Edit Category
15) Category List
16) Hide Category
17)
//

*/
