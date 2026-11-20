
"use strict";

const User = require("./User");
const Room = require("./Room");
const Category = require("./Category");
const Ticket = require("./Ticket");


User.hasMany(Ticket, {
    foreignKey: "createdBy",
    as: "reportedTickets"
});

Ticket.belongsTo(User, {
    foreignKey: "createdBy",
    as: "reporter"
});


User.hasMany(Ticket, {
    foreignKey: "assignedTo",
    as: "assignedTickets"
});

Ticket.belongsTo(User, {
    foreignKey: "assignedTo",
    as: "technician"
});


Room.hasMany(Ticket, {
    foreignKey: "roomId",
    as: "tickets"
});

Ticket.belongsTo(Room, {
    foreignKey: "roomId",
    as: "room"
});


Category.hasMany(Ticket, {
    foreignKey: "categoryId",
    as: "tickets"
});

Ticket.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category"
});


module.exports = {
    User,
    Room,
    Category,
    Ticket
};
