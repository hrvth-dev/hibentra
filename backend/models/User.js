"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    username: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
    },

    email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true
    },

    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash"
    },

    role: {
        type: DataTypes.ENUM(
            "USER",
            "TECHNICIAN",
            "ADMIN"
        ),
        allowNull: false,
        defaultValue: "USER"
    }
}, {
    tableName: "users",
    timestamps: true,
    underscored: true
});

module.exports = User;