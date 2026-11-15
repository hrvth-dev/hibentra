
"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { UniqueConstraintError } = require("sequelize");
const User = require("../models/User.js");


function generateToken(user) {
    return jwt.sign(
        {
            sub: String(user.id)
        },
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "12h"
        }
    );
}


function publicUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    };
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Az email és a jelszó megadása kötelező."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            where: {
                email: normalizedEmail
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Hibás email vagy jelszó."
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Hibás email vagy jelszó."
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Sikeres bejelentkezés.",
            data: {
                token,
                user: publicUser(user)
            }
        });

    } catch (error) {
        console.error("Bejelentkezési hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Szerverhiba történt a bejelentkezés során."
        });
    }
};


const me = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: publicUser(req.user)
        }
    });
};



const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Hiányzó vagy érvénytelen felhasználói adatok."
            });
        }

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();


        if (
            normalizedUsername.length < 3 ||
            normalizedUsername.length > 40 ||
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 72) {
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
            role: "USER"
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

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                success: false,
                message: "Az adatok nem felelnek meg a követelményeknek."
            });
        }

        console.error("Felhasználó létrehozási hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Szerverhiba történt a felhasználó létrehozásakor."
        });
    }
};

module.exports = {
    login,
    me,
    register
};
