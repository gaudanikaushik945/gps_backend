const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
    driverName: String,
  password: String,
  mobileNumber: Number,
  carModel: String,
  rcBookNumber: {
    type: String,
    unique: true
  },
  token: String,
  isActive: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
})

const Driver =  mongoose.model("Driver", driverSchema);
module.exports = Driver
