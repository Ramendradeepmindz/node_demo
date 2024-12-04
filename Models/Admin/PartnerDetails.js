import mongoose from "mongoose";

const partnerScheme = new mongoose.Schema({
  
  Name: { type: String, require: true, trim: true, default: "" },
  EmailID: { type: String, require: true, trim: true },

  phoneNo: { type: String, require: true, trim: true, default: "" },
  panCard: { type: String, require: true, trim: true, default: "" },
  adharaCard: { type: String, require: true, trim: true, default: "" },
  GSTNo: { type: String, require: true, trim: true, default: "" },
  profileImg: { type: Object, require: false, trim: false, default: "" },
  JWT_Token: [],
  Firebase_Token: [],
  role: {
    type: String,
    default: "",
  },


  loginStatus: { type: Boolean, default: false },

  createDate: { type: Date, default: Date.now },

  totalAmount: { type: Number, default: 0, },
  pendingAmount: { type: Number, default: 0, },
  settlementAmount: { type: Number, default: 0,  },
  activeProduct: { type: Number, default: 0, },
  inactiveProduct: { type: Number, default: 0, },

  shopOpenStatus:{
  type: String,
  default: "Inactive"
}
});

const PartnerScheme = mongoose.model("PartnerScheme", partnerScheme);
export default PartnerScheme;
//
