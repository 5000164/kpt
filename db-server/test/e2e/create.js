"use strict"

const mongoose = require("mongoose")
const axios = require("axios")
const assert = require("assert")

const Kpt = require("../../schemas/KptSchema")

describe("create", () => {
  before(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/kpt", {
      useNewUrlParser: true,
    })
  })

  after(async () => {
    await mongoose.disconnect()
  })

  afterEach(async () => {
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
          transform: (doc, ret, _) => {
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

  it("multiple values", async () => {
    assert.deepStrictEqual(await Kpt.find({}), [])

    await axios.post("http://127.0.0.1:8081/create", {
      keep: ["keep1"],
      problem: ["problem1", "problem2"],
      try: ["try1", "try2", "try3"],
    })

    assert.deepStrictEqual(
      (await Kpt.find({})).map(d =>
        d.toJSON({
          transform: (doc, ret, _) => {
            delete ret._id
            return ret
          },
          versionKey: false,
        })
      ),
      [
        {
          keep: ["keep1"],
          problem: ["problem1", "problem2"],
          try: ["try1", "try2", "try3"],
        },
      ]
    )
  })

  it("multiple times", async () => {
    assert.deepStrictEqual(await Kpt.find({}), [])

    await axios.post("http://127.0.0.1:8081/create", {
      keep: ["keep1"],
      problem: ["problem1"],
      try: ["try1"],
    })

    assert.deepStrictEqual(
      (await Kpt.find({})).map(d =>
        d.toJSON({
          transform: (doc, ret, _) => {
            delete ret._id
            return ret
          },
          versionKey: false,
        })
      ),
      [
        {
          keep: ["keep1"],
          problem: ["problem1"],
          try: ["try1"],
        },
      ]
    )

    await axios.post("http://127.0.0.1:8081/create", {
      keep: ["keep2"],
      problem: ["problem2"],
      try: ["try2"],
    })

    assert.deepStrictEqual(
      (await Kpt.find({})).map(d =>
        d.toJSON({
          transform: (doc, ret, _) => {
            delete ret._id
            return ret
          },
          versionKey: false,
        })
      ),
      [
        {
          keep: ["keep1"],
          problem: ["problem1"],
          try: ["try1"],
        },
        {
          keep: ["keep2"],
          problem: ["problem2"],
          try: ["try2"],
        },
      ]
    )
  })
})
