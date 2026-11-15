"use strict";

const express = require("express");

const router = express.Router();

const controller = require("../controllers/authController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.post("/users", controller.register);

module.exports = router;