
"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const Category = sequelize.define("Category", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
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
    tableName: "categories",
    timestamps: true,
    underscored: true,

    indexes: [
        {
            name: "uq_categories_name",
            unique: true,
            fields: ["name"]
        }
    ]
});

module.exports = Category;
