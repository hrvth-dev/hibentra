
"use strict";

const bcrypt = require("bcryptjs");

const { UniqueConstraintError, ValidationError} = require("sequelize");

const User = require("../models/User.js");



function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
    };
}



const getMe = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "A profil megtekintéséhez bejelentkezés szükséges."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Felhasználói profil sikeresen lekérve.",
            data: {
                user: publicUser(user)
            }
        });

    } catch (error) {
        console.error("Profil lekérési hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Nem sikerült lekérni a profilt."
        });
    }
};



const listUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                "id",
                "username",
                "email",
                "role",
                "isActive",
                "createdAt",
                "updatedAt"
            ],
            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Felhasználók sikeresen lekérve.",
            data: {
                users,
                total: users.length
            }
        });

    } catch (error) {
        console.error("Felhasználók lekérési hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Nem sikerült lekérni a felhasználókat."
        });
    }
};



const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body || {};

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof role !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "A felhasználónév, email, jelszó és szerepkör kötelező."
            });
        }

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const allowedRoles = [
            "USER",
            "TECHNICIAN",
            "ADMIN"
        ];

        if (
            normalizedUsername.length < 3 ||
            normalizedUsername.length > 40 ||
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 72 ||
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen felhasználónév, email, jelszó vagy szerepkör."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            passwordHash,
            role
        });

        return res.status(201).json({
            success: true,
            message: "Felhasználó sikeresen létrehozva.",
            data: {
                user: publicUser(user)
            }
        });

    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                success: false,
                message: "A felhasználónév vagy email már foglalt."
            });
        }

        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen felhasználói adatok."
            });
        }

        console.error("Felhasználó létrehozási hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Szerverhiba történt a felhasználó létrehozásakor."
        });
    }
};



const updateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen felhasználói azonosító."
            });
        }

        const { username, email, role } = req.body || {};

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof role !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "A felhasználónév, email és szerepkör kötelező."
            });
        }

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const allowedRoles = [
            "USER",
            "TECHNICIAN",
            "ADMIN"
        ];

        if (
            normalizedUsername.length < 3 ||
            normalizedUsername.length > 40 ||
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen felhasználói adatok."
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "A felhasználó nem található."
            });
        }


        if (
            req.user.id === user.id &&
            role !== user.role
        ) {
            return res.status(403).json({
                success: false,
                message: "A saját szerepkörödet nem módosíthatod."
            });
        }

        await user.update({
            username: normalizedUsername,
            email: normalizedEmail,
            role
        });

        return res.status(200).json({
            success: true,
            message: "Felhasználó sikeresen frissítve.",
            data: {
                user: publicUser(user)
            }
        });

    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                success: false,
                message: "A felhasználónév vagy email már foglalt."
            });
        }

        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen felhasználói adatok."
            });
        }

        console.error("Felhasználó frissítési hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Szerverhiba történt a frissítés során."
        });
    }
};



const deactivateUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen felhasználói azonosító."
            });
        }

        if (req.user.id === userId) {
            return res.status(403).json({
                success: false,
                message: "A saját fiókodat nem deaktiválhatod."
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "A felhasználó nem található."
            });
        }

        if (!user.isActive) {
            return res.status(200).json({
                success: true,
                message: "A felhasználó már deaktiválva van."
            });
        }

        await user.update({
            isActive: false
        });

        return res.status(200).json({
            success: true,
            message: "Felhasználó sikeresen deaktiválva."
        });

    } catch (error) {
        console.error("Felhasználó deaktiválási hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Szerverhiba történt a deaktiválás során."
        });
    }
};


module.exports = {
    getMe,
    listUsers,
    createUser,
    updateUser,
    deactivateUser
};
