"use strict"

const mongoose = require("mongoose")
const axios = require("axios")
const assert = require("assert")

const Kpt = require("../../schemas/KptSchema")

describe("getLatest", () => {
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

    const kpt = new Kpt({
      keep: ["keep"],
      problem: ["problem"],
      try: ["try"],
    })
    await kpt.save()

    const d = (await axios.post("http://127.0.0.1:8081/getLatest")).data
    assert.deepStrictEqual(d.keep, ["keep"])
    assert.deepStrictEqual(d.problem, ["problem"])
    assert.deepStrictEqual(d.try, ["try"])
  })

  it("multiple values", async () => {
    assert.deepStrictEqual(await Kpt.find({}), [])

    const kpt1 = new Kpt({
      keep: ["keep1"],
      problem: ["problem1"],
      try: ["try1"],
    })
    await kpt1.save()
    const kpt2 = new Kpt({
      keep: ["keep2"],
      problem: ["problem2"],
      try: ["try2"],
    })
    await kpt2.save()

    const d = (await axios.post("http://127.0.0.1:8081/getLatest")).data
    assert.deepStrictEqual(d.keep, ["keep2"])
    assert.deepStrictEqual(d.problem, ["problem2"])
    assert.deepStrictEqual(d.try, ["try2"])
  })

  it("multiple times", async () => {
    assert.deepStrictEqual(await Kpt.find({}), [])

    const kpt1 = new Kpt({
      keep: ["keep1"],
      problem: ["problem1"],
      try: ["try1"],
    })
    await kpt1.save()

    const d1 = (await axios.post("http://127.0.0.1:8081/getLatest")).data
    assert.deepStrictEqual(d1.keep, ["keep1"])
    assert.deepStrictEqual(d1.problem, ["problem1"])
    assert.deepStrictEqual(d1.try, ["try1"])

    const kpt2 = new Kpt({
      keep: ["keep2"],
      problem: ["problem2"],
      try: ["try2"],
    })
    await kpt2.save()

    const d2 = (await axios.post("http://127.0.0.1:8081/getLatest")).data
    assert.deepStrictEqual(d2.keep, ["keep2"])
    assert.deepStrictEqual(d2.problem, ["problem2"])
    assert.deepStrictEqual(d2.try, ["try2"])
  })
})
