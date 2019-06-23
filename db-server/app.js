const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const port = 8081

const Kpt = require("./schemas/KptSchema")

app.use(bodyParser.json())

app.post("/create", async (req, res) => {
  await mongoose.connect("mongodb://db:27017/kpt", {
    useNewUrlParser: true,
  })

  const kpt = new Kpt(req.body)
  await kpt.save()

  res.send()
})

app.post("/getLatest", async (req, res) => {
  await mongoose.connect("mongodb://db:27017/kpt", {
    useNewUrlParser: true,
  })

  const result = await Kpt.findOne({})
    .sort({ created_at: -1 })
    .lean()

  res.json(result)
})

app.post("/getList", async (req, res) => {
  await mongoose.connect("mongodb://db:27017/kpt", {
    useNewUrlParser: true,
  })

  const result = await Kpt.find({}).lean()

  res.json(result)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
