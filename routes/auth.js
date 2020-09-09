const express = require('express');
const router = express.Router();
const passportJWT = require("../middleware/passportJWT")();
const authController = require("../controllers/authController");
const { isEmail, hasPassword, hasName } = require("../validators/validators");
router.post("/login", authController.login);
router.post("/signup", [isEmail, hasPassword, hasName], authController.signup);
router.get("/me", passportJWT.authenticate(), authController.me);
module.exports = router;