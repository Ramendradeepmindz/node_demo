import mongoose from "mongoose";

const partnerScheme = new mongoose.Schema({
  name: { type: String, require: true, trim: true, default: "" },
  email: { type: String, require: true, trim: true },

  phoneNo: { type: String, require: true, trim: true },
  profileImg: { type: String, require: false, trim: false, default: "" },
  token: { type: String, trim: false, default: "" },
  loginStatus: { type: Boolean, default: false },

  createDate: { type: Date, default: Date.now },

  totalAmount: { type: Number, default: 0, require: true },
  pendingAmount: { type: Number, default: 0, require: true },
  settlementAmount: { type: Number, default: 0, require: true },
  activeProduct: { type: Number, default: 0, require: true },
  inactiveProduct: { type: Number, default: 0, require: true },

  openStatus: { type: Boolean, default: false, require: true },
});

const PartnerScheme = mongoose.model("PartnerScheme", partnerScheme);
export default PartnerScheme;
//
