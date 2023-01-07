const express = require("express");
const router = express.Router();
const {
    signInUser,
    logInUser,
    checkToken,
    logOut
} = require("../controllers/auth")
const {
    signin,
    login
} = require("../validator/validator")

router.route("/signin").post(signin, signInUser)
router.route("/login").post(login, logInUser)
router.route("/refresh_token").post(checkToken)
router.route("/logout").post(logOut)

module.exports = router