import express from "express";
const routes = express.Router();
import AdminController from "../Controllers/Admin/adminControllers.js";

import adminMidi from "../Middlewares/adminAuth.js";
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
routes.get("/logout", adminMidi.adminToken, AdminController.logout);
routes.get("/getProfile", adminMidi.adminToken, AdminController.getProfile);
routes.post("/uploadImage",adminMidi.adminToken, upload.single('file'), AdminController.uploadImage)
routes.post("/editProfile",adminMidi.adminToken, AdminController.editProfile)


routes.post("/addPartner",adminMidi.adminToken,validatePartner.validatePartner(), AdminController.addPartner)
routes.post("/partnerStatusChange",adminMidi.adminToken,validatePartner.statusChangePartner(), AdminController.partnerStatusChange)
routes.get("/getAllPartner",adminMidi.adminToken, AdminController.getAllPartner)

export default routes;
