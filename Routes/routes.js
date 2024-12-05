import express from "express";
const routes = express.Router();
import AdminController from "../Controllers/Admin/adminControllers.js";

import admin from "../Middlewares/adminAuth.js";
import validatePartner from '../Helper/validatorHelper.js';
import multer from "multer"
const upload = multer(
          {
           dest: 'uploads/',
           

 },


);
//Admin

routes.post("/adminRegister", AdminController.adminRegistration);
routes.post("/adminLogin", AdminController.adminLogin);
routes.post("/resetPassword", AdminController.resetPassword);
routes.post("/forgotPassword", AdminController.forgotPassword);
routes.get("/logout", admin.adminToken, AdminController.logout);
routes.get("/getProfile", admin.adminToken, AdminController.getProfile);
routes.post("/uploadImage",admin.adminToken, upload.single('file'), AdminController.uploadImage)
routes.post("/editProfile",admin.adminToken, AdminController.editProfile)


routes.post("/addPartner",admin.adminToken,validatePartner.validatePartner(), AdminController.addPartner)
routes.post("/partnerStatusChange",admin.adminToken,validatePartner.statusChangePartner(), AdminController.partnerStatusChange)
routes.get("/getAllPartner",admin.adminToken, AdminController.getAllPartner)




//Category


routes.post("/addCategory",admin.adminToken,upload.single('file'), AdminController.addCategory)
routes.get("/getCategory",admin.adminToken, AdminController.categoryListData)
routes.post("/updateCategoryByName",admin.adminToken, AdminController.updateCategoryByName)
routes.post("/categoryStatusChange",admin.adminToken,validatePartner.statusChangePartner(), AdminController.categoryStatusChange)
routes.post("/updateCategoryImage",admin.adminToken,admin.adminToken,upload.single('file'), AdminController.updateCategoryImage)

export default routes;
