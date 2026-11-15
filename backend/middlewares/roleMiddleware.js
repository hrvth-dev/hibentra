"use strict";

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Bejelentkezés szükséges."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Nincs jogosultságod ehhez a művelethez."
            });
        }

        next();
    };
};

module.exports = authorizeRoles;