const mongoose = require("mongoose")

const kptSchema = new mongoose.Schema({
  keep: [String],
  problem: [String],
  try: [String],
})
const Kpt = mongoose.model("Kpt", kptSchema)
module.exports = Kpt
