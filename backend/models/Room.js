
"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const Room = sequelize.define("Room", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    building: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },

    roomNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "room_number",
        validate: {
            notEmpty: true,
            len: [1, 20]
        }
    },

    floor: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active"
    }
}, {
    tableName: "rooms",
    timestamps: true,
    underscored: true,

    indexes: [
        {
            name: "uq_rooms_building_number",
            unique: true,
            fields: ["building", "room_number"]
        }
    ]
});

module.exports = Room;
