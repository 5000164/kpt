const mongoose = require("mongoose")

const kptSchema = new mongoose.Schema(
  {
    keep: [String],
    problem: [String],
    try: [String],
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
)
const Kpt = mongoose.model("Kpt", kptSchema)
module.exports = Kpt
