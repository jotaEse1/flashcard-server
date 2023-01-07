const express = require("express")
const router = express.Router()

const {updateWords} = require("../controllers/study")

router.route("/update").post(updateWords)

module.exports = router