import AdminDetails from "../../Models/Admin/AdminDetails.js";
import bcrypt from "bcrypt";
import validation from "../../Validation/validator.js";
import jwt from "jsonwebtoken";
import UtilText from "../../Helper/messageHelper.js";

import mongoose from "mongoose";

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
      const { authorization } = req.headers;
      var token = authorization;
      // AdminDetails.findByIdAndUpdate({ _id: _id }, { $pull: { token: token } }, { new: true }).exec(function(err, userResult) {
      //     if (err) {
      //         return Helper.response(res, 422, "Something went wrong.")
      //     } else {
      //         return Helper.response(res, 200, "Logout successfully.")

      //     }
      // });

      const data = await AdminDetails.findByIdAndUpdate(
        req.user._id,
        { token: "" },
        function (err, docs) {
          if (err) {
            conslole.log(err);
          } else {
            console.log(docs);
          }
        }
      );
    } catch (error) {
      return Helper.response(res, 500, "Server error.");
    }
    //   try {
    //     const { id } = req.user;

    //     await AdminDetails.updateOne(
    //       { _id: id },
    //       { token: "" }
    //     );
    //     return res.status(404).json({
    //       StatusCode: 404,
    //       Status: "Success",
    //       Message: UtilText.LogoutSuccess,
    //     });

    //   } catch (error) {
    //     return res.status(404).json({
    //       StatusCode: 404,
    //       Status: "Failed"+error,
    //       Message: UtilText.UserNotFound,
    //     });
    //   }
    // };
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


*/
