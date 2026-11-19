
"use strict";

const express = require("express");
const router = express.Router();

const controller = require("../controllers/categoryController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");



router.use(authenticate);


// Felhasználók, karbantartók és adminisztrátorok

router.get("/", controller.listCategories);

router.get("/:id", controller.getCategory);


// Kizárólag adminisztrátorok

router.post("/",authorizeRoles("ADMIN"),controller.createCategory);

router.put("/:id",authorizeRoles("ADMIN"),controller.updateCategory);

router.delete("/:id",authorizeRoles("ADMIN"),controller.deactivateCategory);


module.exports = router;
