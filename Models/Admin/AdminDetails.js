import mongoose from "mongoose";

const adminScheme = new mongoose.Schema({
  name: { type: String, require: true, trim: true, default: "" },
  email: { type: String, require: true, trim: true },
  password: { type: String, require: true, trim: true },
  phoneNo: { type: String, require: true, trim: true },
  profileImg: { type: String, require: false, trim: false, default: "" },
  token: { type: String, trim: false, default: "" },
  status: { type: Boolean, default: false },
  createDate: { type: Date, default: Date.now },
});

const AdminDetails = mongoose.model("adminDetails", adminScheme);
export default AdminDetails;
