"use strict";

const express = require("express");
const router = express.Router();

const controller = require("../controllers/userController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/users", controller.listUsers);
router.post("/users", controller.createUser);
router.put("/users/:id", controller.updateUser);
router.delete("/users/:id", controller.deactivateUser);

module.exports = router;