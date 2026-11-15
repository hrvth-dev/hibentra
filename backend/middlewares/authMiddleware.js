"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        const match = /^Bearer (.+)$/i.exec(
            authorization || ""
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "A művelethez bejelentkezés szükséges."
            });
        }

        const token = match[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

        const user = await User.findByPk(decoded.sub);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Érvénytelen munkamenet."
            });
        }

        req.user = user;

        next();

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Érvénytelen vagy lejárt token."
            });
        }

        console.error("Autentikációs hiba:", error);

        return res.status(500).json({
            success: false,
            message: "Szerverhiba történt a hitelesítés során."
        });
    }
};

module.exports = authenticate;