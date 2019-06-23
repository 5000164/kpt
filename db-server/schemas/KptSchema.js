const mongoose = require("mongoose")

const kptSchema = new mongoose.Schema(
  {
    keep: [String],
    problem: [String],
    try: [String],
  },
  {
    versionKey: false,
  }
)
const Kpt = mongoose.model("Kpt", kptSchema)
module.exports = Kpt
