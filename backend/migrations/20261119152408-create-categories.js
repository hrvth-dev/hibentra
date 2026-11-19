
"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable("categories", {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            name: {
                type: Sequelize.STRING(100),
                allowNull: false
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
            "categories",
            ["name"],
            {
                name: "uq_categories_name",
                unique: true
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("categories");
    }
};
