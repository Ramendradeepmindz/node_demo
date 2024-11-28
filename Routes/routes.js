import express from "express";
const routes = express.Router();
import AdminController from "../Controllers/Admin/adminControllers.js";
import adminMidi from "../Middlewares/userAuth.js";

//Admin

routes.post("/adminRegister", AdminController.adminRegistration);
routes.post("/adminLogin", AdminController.adminLogin);
routes.post("/resetPassword", AdminController.resetPassword);
routes.post("/forgotPassword", AdminController.forgotPassword);
routes.get("/logout", adminMidi.adminToken, AdminController.logout);

export default routes;
