
"use strict";

module.exports = {

    async up(queryInterface, Sequelize) {

        await queryInterface.createTable("tickets", {

            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            title: {
                type: Sequelize.STRING(150),
                allowNull: false
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },

            room_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: "rooms",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT"
            },

            category_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: "categories",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT"
            },

            created_by: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT"
            },

            assigned_to: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            },

            status: {
                type: Sequelize.ENUM(
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
                type: Sequelize.ENUM(
                    "LOW",
                    "MEDIUM",
                    "HIGH",
                    "CRITICAL"
                ),
                allowNull: false,
                defaultValue: "MEDIUM"
            },

            resolved_at: {
                type: Sequelize.DATE,
                allowNull: true
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
            "tickets",
            ["assigned_to", "status"],
            {
                name: "idx_tickets_assigned_status"
            }
        );

        await queryInterface.addIndex(
            "tickets",
            ["created_by", "status"],
            {
                name: "idx_tickets_created_status"
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("tickets");
    }
};
