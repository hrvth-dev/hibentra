
"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const Ticket = sequelize.define("Ticket", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [5, 150]
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },

    roomId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "room_id"
    },

    categoryId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "category_id"
    },

    createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "created_by"
    },

    assignedTo: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: "assigned_to"
    },

    status: {
        type: DataTypes.ENUM(
            "NEW",
            "ASSIGNED",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED"
        ),
        allowNull: false,
        defaultValue: "NEW"
    },

    priority: {
        type: DataTypes.ENUM(
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ),
        allowNull: false,
        defaultValue: "MEDIUM"
    },

    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "resolved_at"
    }

}, {
    tableName: "tickets",
    timestamps: true,
    underscored: true
});

module.exports = Ticket;
