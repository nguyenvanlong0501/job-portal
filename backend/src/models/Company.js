import mongoose from "mongoose";

const companySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  locked: { type: Boolean, default: false },
});

const Company = mongoose.model("Company", companySchema);

export default Company;
