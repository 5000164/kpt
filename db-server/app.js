const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const port = 8081

app.use(bodyParser.json())

app.post("/create", (req, res) => {
  res.send()
})

app.post("/getList", (req, res) => {
  res.send()
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
