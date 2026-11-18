"use strict";

const express = require("express");
const router = express.Router();

const controller = require("../controllers/roomController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// Minden helyiség-végpont bejelentkezést igényel.

router.use(authenticate);

// Bejelentkezett felhasználók

router.get("/", controller.listRooms);
router.get("/:id", controller.getRoom);

// Kizárólag adminisztrátoroknak

router.post("/",authorizeRoles("ADMIN"),controller.createRoom);

router.put("/:id",authorizeRoles("ADMIN"),controller.updateRoom);

router.delete("/:id",authorizeRoles("ADMIN"), controller.deactivateRoom);

module.exports = router;