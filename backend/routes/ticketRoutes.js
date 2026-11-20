"use strict";

const express = require("express");
const router = express.Router();

const controller = require("../controllers/ticketController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");


router.use(authenticate);


router.get("/", controller.listTickets);


router.get("/assigned",authorizeRoles("TECHNICIAN", "ADMIN"),controller.getAssignedTickets);


router.get("/:id", controller.getTicket);


router.post("/", controller.createTicket);


router.put("/:id", controller.updateTicket);


router.patch("/:id/assign",authorizeRoles("ADMIN"),controller.assignTicket);


router.patch("/:id/status",authorizeRoles("TECHNICIAN", "ADMIN"),controller.updateTicketStatus);


router.patch("/:id/priority",authorizeRoles("ADMIN"),controller.updateTicketPriority);


module.exports = router;