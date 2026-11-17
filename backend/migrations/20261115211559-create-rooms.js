
"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("rooms", {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },

            building: {
                type: Sequelize.STRING(100),
                allowNull: false
            },

            room_number: {
                type: Sequelize.STRING(20),
                allowNull: false
            },

            floor: {
                type: Sequelize.INTEGER,
                allowNull: true
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex(
            "rooms",
            ["building", "room_number"],
            {
                unique: true,
                name: "uq_rooms_building_number"
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("rooms");
    }
};
