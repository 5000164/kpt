"use strict"

const mongoose = require("mongoose")
const axios = require("axios")
const assert = require("assert")

const Kpt = require("../../schemas/KptSchema")

describe("KPT", () => {
  describe("create", () => {
    before(async () => {
      await mongoose.connect("mongodb://127.0.0.1:27017/kpt", {
        useNewUrlParser: true,
      })
    })

    after(async () => {
      await Kpt.deleteMany({})
    })

    it("normal values", async () => {
      assert.deepStrictEqual(await Kpt.find({}), [])

      await axios.post("http://127.0.0.1:8081/create", {
        keep: ["keep"],
        problem: ["problem"],
        try: ["try"],
      })

      assert.deepStrictEqual(
        (await Kpt.find({})).map(d =>
          d.toJSON({
            transform: (doc, ret, options) => {
              delete ret._id
              return ret
            },
            versionKey: false,
          })
        ),
        [
          {
            keep: ["keep"],
            problem: ["problem"],
            try: ["try"],
          },
        ]
      )
    })
  })
})
