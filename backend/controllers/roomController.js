
"use strict";

const { UniqueConstraintError, ValidationError } = require("sequelize");

const Room = require("../models/Room.js");



function validateRoom(body) {
    const {
        building,
        roomNumber,
        floor = null,
        description = null
    } = body || {};

    if (
        typeof building !== "string" ||
        typeof roomNumber !== "string"
    ) {
        return {
            error: "Az épület és a teremszám megadása kötelező."
        };
    }

    const normalizedBuilding = building.trim();
    const normalizedRoomNumber = roomNumber.trim();

    if (
        normalizedBuilding.length < 1 ||
        normalizedBuilding.length > 100 ||
        normalizedRoomNumber.length < 1 ||
        normalizedRoomNumber.length > 20
    ) {
        return {
            error: "Érvénytelen épületnév vagy teremszám."
        };
    }

    if (
        floor !== null &&
        !Number.isInteger(floor)
    ) {
        return {
            error: "Az emeletnek egész számnak kell lennie."
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
            building: normalizedBuilding,
            roomNumber: normalizedRoomNumber,
            floor,
            description: description?.trim() || null
        }
    };
}



function parseRoomId(value) {
    const roomId = Number(value);

    if (!Number.isSafeInteger(roomId) || roomId <= 0) {
        return null;
    }

    return roomId;
}



function handleRoomError(res, error) {
    if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
            success: false,
            message: "Ebben az épületben már létezik ilyen teremszám."
        });
    }

    if (error instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            message: "Érvénytelen helyiségadatok."
        });
    }

    console.error("Helyiségkezelési hiba:", error);

    return res.status(500).json({
        success: false,
        message: "Szerverhiba történt a helyiség kezelése során."
    });
}



const listRooms = async (req, res) => {
    try {
        const where = req.user.role === "ADMIN"
            ? {}
            : { isActive: true };

        const rooms = await Room.findAll({
            where,
            order: [
                ["building", "ASC"],
                ["roomNumber", "ASC"]
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Helyiségek sikeresen lekérve.",
            data: {
                rooms,
                total: rooms.length
            }
        });

    } catch (error) {
        return handleRoomError(res, error);
    }
};



const getRoom = async (req, res) => {
    try {
        const roomId = parseRoomId(req.params.id);

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen helyiségazonosító."
            });
        }

        const room = await Room.findByPk(roomId);

        if (
            !room ||
            (!room.isActive && req.user.role !== "ADMIN")
        ) {
            return res.status(404).json({
                success: false,
                message: "A helyiség nem található."
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                room
            }
        });

    } catch (error) {
        return handleRoomError(res, error);
    }
};



const createRoom = async (req, res) => {
    try {
        const validation = validateRoom(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const room = await Room.create(validation.data);

        return res.status(201).json({
            success: true,
            message: "Helyiség sikeresen létrehozva.",
            data: {
                room
            }
        });

    } catch (error) {
        return handleRoomError(res, error);
    }
};



const updateRoom = async (req, res) => {
    try {
        const roomId = parseRoomId(req.params.id);

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen helyiségazonosító."
            });
        }

        const validation = validateRoom(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const room = await Room.findByPk(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "A helyiség nem található."
            });
        }

        await room.update(validation.data);

        return res.status(200).json({
            success: true,
            message: "Helyiség sikeresen frissítve.",
            data: {
                room
            }
        });

    } catch (error) {
        return handleRoomError(res, error);
    }
};



const deactivateRoom = async (req, res) => {
    try {
        const roomId = parseRoomId(req.params.id);

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen helyiségazonosító."
            });
        }

        const room = await Room.findByPk(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "A helyiség nem található."
            });
        }

        if (!room.isActive) {
            return res.status(200).json({
                success: true,
                message: "A helyiség már deaktiválva van."
            });
        }

        await room.update({
            isActive: false
        });

        return res.status(200).json({
            success: true,
            message: "Helyiség sikeresen deaktiválva."
        });

    } catch (error) {
        return handleRoomError(res, error);
    }
};


module.exports = {
    listRooms,
    getRoom,
    createRoom,
    updateRoom,
    deactivateRoom
};
