"use strict";

const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authMiddleware");


router.use(authenticate);

router.get("/me", userController.getMe);

module.exports = router;