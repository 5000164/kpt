const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const port = 8081

const kptSchema = new mongoose.Schema({
  keep: [String],
  problem: [String],
  try: [String],
})
const Kpt = mongoose.model("Kpt", kptSchema)

app.use(bodyParser.json())

app.post("/create", async (req, res) => {
  await mongoose.connect("mongodb://127.0.0.1:27017/kpt", {
    useNewUrlParser: true,
  })

  const kpt = new Kpt(req.body)
  await kpt.save()

  res.send()
})

app.post("/getList", async (req, res) => {
  await mongoose.connect("mongodb://127.0.0.1:27017/kpt", {
    useNewUrlParser: true,
  })

  const result = await Kpt.find({}).exec()

  res.send(result)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
