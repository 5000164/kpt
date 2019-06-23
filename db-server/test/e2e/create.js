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

    const d = await Kpt.find({}).lean()
    assert.deepStrictEqual(["keep"], ["keep"])
    assert.deepStrictEqual(d[0].keep, ["keep"])
    assert.deepStrictEqual(d[0].problem, ["problem"])
    assert.deepStrictEqual(d[0].try, ["try"])
  })

  it("multiple values", async () => {
    assert.deepStrictEqual(await Kpt.find({}), [])

    await axios.post("http://127.0.0.1:8081/create", {
      keep: ["keep1"],
      problem: ["problem1", "problem2"],
      try: ["try1", "try2", "try3"],
    })

    const d = await Kpt.find({}).lean()
    assert.deepStrictEqual(d[0].keep, ["keep1"])
    assert.deepStrictEqual(d[0].problem, ["problem1", "problem2"])
    assert.deepStrictEqual(d[0].try, ["try1", "try2", "try3"])
  })

  it("multiple times", async () => {
    assert.deepStrictEqual(await Kpt.find({}), [])

    await axios.post("http://127.0.0.1:8081/create", {
      keep: ["keep1"],
      problem: ["problem1"],
      try: ["try1"],
    })

    const d1 = await Kpt.find({}).lean()
    assert.deepStrictEqual(d1[0].keep, ["keep1"])
    assert.deepStrictEqual(d1[0].problem, ["problem1"])
    assert.deepStrictEqual(d1[0].try, ["try1"])

    await axios.post("http://127.0.0.1:8081/create", {
      keep: ["keep2"],
      problem: ["problem2"],
      try: ["try2"],
    })

    const d2 = await Kpt.find({}).lean()
    assert.deepStrictEqual(d2[0].keep, ["keep1"])
    assert.deepStrictEqual(d2[0].problem, ["problem1"])
    assert.deepStrictEqual(d2[0].try, ["try1"])
    assert.deepStrictEqual(d2[1].keep, ["keep2"])
    assert.deepStrictEqual(d2[1].problem, ["problem2"])
    assert.deepStrictEqual(d2[1].try, ["try2"])
  })
})
