
"use strict";

const { UniqueConstraintError, ValidationError } = require("sequelize");

const Category = require("../models/Category.js");



function parseCategoryId(value) {
    const categoryId = Number(value);

    if (
        !Number.isSafeInteger(categoryId) ||
        categoryId <= 0
    ) {
        return null;
    }

    return categoryId;
}



function validateCategory(body) {
    const {
        name,
        description = null
    } = body || {};

    if (typeof name !== "string") {
        return {
            error: "A kategória neve kötelező."
        };
    }

    const normalizedName = name.trim();

    if (
        normalizedName.length < 1 ||
        normalizedName.length > 100
    ) {
        return {
            error: "A kategória neve 1 és 100 karakter közötti lehet."
        };
    }

    if (
        description !== null &&
        typeof description !== "string"
    ) {
        return {
            error: "A leírásnak szövegnek kell lennie."
        };
    }

    return {
        data: {
            name: normalizedName,
            description: description?.trim() || null
        }
    };
}



function handleCategoryError(res, error) {

    if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
            success: false,
            message: "Már létezik ilyen nevű kategória."
        });
    }

    if (error instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            message: "Érvénytelen kategóriaadatok."
        });
    }

    console.error("Kategóriakezelési hiba:", error);

    return res.status(500).json({
        success: false,
        message: "Szerverhiba történt a kategória kezelése során."
    });
}



const listCategories = async (req, res) => {
    try {



        const where = req.user.role === "ADMIN"
            ? {}
            : { isActive: true };

        const categories = await Category.findAll({
            where,
            order: [
                ["name", "ASC"]
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Kategóriák sikeresen lekérve.",
            data: {
                categories,
                total: categories.length
            }
        });

    } catch (error) {
        return handleCategoryError(res, error);
    }
};



const getCategory = async (req, res) => {
    try {
        const categoryId = parseCategoryId(req.params.id);

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen kategóriaazonosító."
            });
        }

        const category = await Category.findByPk(categoryId);

        if (
            !category ||
            (!category.isActive && req.user.role !== "ADMIN")
        ) {
            return res.status(404).json({
                success: false,
                message: "A kategória nem található."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Kategória sikeresen lekérve.",
            data: {
                category
            }
        });

    } catch (error) {
        return handleCategoryError(res, error);
    }
};



const createCategory = async (req, res) => {
    try {
        const validation = validateCategory(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const category = await Category.create(
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "Kategória sikeresen létrehozva.",
            data: {
                category
            }
        });

    } catch (error) {
        return handleCategoryError(res, error);
    }
};



const updateCategory = async (req, res) => {
    try {
        const categoryId = parseCategoryId(req.params.id);

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen kategóriaazonosító."
            });
        }

        const validation = validateCategory(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const category = await Category.findByPk(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "A kategória nem található."
            });
        }

        await category.update(validation.data);

        return res.status(200).json({
            success: true,
            message: "Kategória sikeresen frissítve.",
            data: {
                category
            }
        });

    } catch (error) {
        return handleCategoryError(res, error);
    }
};



const deactivateCategory = async (req, res) => {
    try {
        const categoryId = parseCategoryId(req.params.id);

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen kategóriaazonosító."
            });
        }

        const category = await Category.findByPk(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "A kategória nem található."
            });
        }

        if (!category.isActive) {
            return res.status(200).json({
                success: true,
                message: "A kategória már deaktiválva van."
            });
        }

        await category.update({
            isActive: false
        });

        return res.status(200).json({
            success: true,
            message: "Kategória sikeresen deaktiválva."
        });

    } catch (error) {
        return handleCategoryError(res, error);
    }
};


module.exports = {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deactivateCategory
};
