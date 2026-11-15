"use strict";

const express = require("express");

const router = express.Router();

const controller = require("../controllers/authController");
const authenticate = require("../middlewares/authMiddleware");

router.post("/login", controller.login);

router.post("/register", controller.register);

router.get("/me", authenticate, controller.me);

module.exports = router;