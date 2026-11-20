
"use strict";

const {
    Op,
    ValidationError,
    ForeignKeyConstraintError
} = require("sequelize");

const {
    Ticket,
    User,
    Room,
    Category
} = require("../models");


// ===============================
// KÖZÖS SEGÉDFÜGGVÉNYEK
// ===============================

function parseId(value) {
    const id = Number(value);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        return null;
    }

    return id;
}


// Hibajegy adatainak ellenőrzése

function validateTicket(body) {
    const {
        title,
        description,
        roomId,
        categoryId
    } = body || {};

    if (
        typeof title !== "string" ||
        typeof description !== "string"
    ) {
        return {
            error: "A cím és a leírás kötelező."
        };
    }

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (
        normalizedTitle.length < 5 ||
        normalizedTitle.length > 150
    ) {
        return {
            error: "A cím 5 és 150 karakter közötti lehet."
        };
    }

    if (
        normalizedDescription.length < 1 ||
        normalizedDescription.length > 5000
    ) {
        return {
            error: "A leírás 1 és 5000 karakter közötti lehet."
        };
    }

    if (
        !Number.isSafeInteger(roomId) ||
        roomId <= 0 ||
        !Number.isSafeInteger(categoryId) ||
        categoryId <= 0
    ) {
        return {
            error: "Érvényes helyiség- és kategóriaazonosító szükséges."
        };
    }

    return {
        data: {
            title: normalizedTitle,
            description: normalizedDescription,
            roomId,
            categoryId
        }
    };
}


// Meglévő és aktív helyiség/kategória ellenőrzése

async function validateReferences(roomId, categoryId) {
    const [room, category] = await Promise.all([
        Room.findByPk(roomId),
        Category.findByPk(categoryId)
    ]);

    if (!room || !room.isActive) {
        return "A kiválasztott helyiség nem létezik vagy inaktív.";
    }

    if (!category || !category.isActive) {
        return "A kiválasztott kategória nem létezik vagy inaktív.";
    }

    return null;
}


// Ki láthatja a hibajegyet?

function canViewTicket(user, ticket) {
    if (user.role === "ADMIN") {
        return true;
    }

    if (Number(ticket.createdBy) === Number(user.id)) {
        return true;
    }

    if (
        user.role === "TECHNICIAN" &&
        Number(ticket.assignedTo) === Number(user.id)
    ) {
        return true;
    }

    return false;
}


// Kapcsolt adatok

const ticketIncludes = [
    {
        model: User,
        as: "reporter",
        attributes: ["id", "username"]
    },
    {
        model: User,
        as: "technician",
        attributes: ["id", "username"]
    },
    {
        model: Room,
        as: "room",
        attributes: [
            "id",
            "building",
            "roomNumber",
            "floor"
        ]
    },
    {
        model: Category,
        as: "category",
        attributes: ["id", "name"]
    }
];


// Egységes hibakezelés

function handleTicketError(res, error) {
    if (error instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            message: "Érvénytelen hibajegyadatok."
        });
    }

    if (error instanceof ForeignKeyConstraintError) {
        return res.status(400).json({
            success: false,
            message: "A hivatkozott adat nem létezik."
        });
    }

    console.error("Ticket API hiba:", error);

    return res.status(500).json({
        success: false,
        message: "Szerverhiba történt a hibajegy kezelése során."
    });
}


// ===============================
// GET /api/tickets
// ===============================

const listTickets = async (req, res) => {
    try {
        let where = {};

        if (req.user.role === "USER") {
            where = {
                createdBy: req.user.id
            };
        }

        if (req.user.role === "TECHNICIAN") {
            where = {
                [Op.or]: [
                    { assignedTo: req.user.id },
                    { createdBy: req.user.id }
                ]
            };
        }

        const tickets = await Ticket.findAll({
            where,
            include: ticketIncludes,
            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Hibajegyek sikeresen lekérve.",
            data: {
                tickets,
                total: tickets.length
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};


// ===============================
// GET /api/tickets/assigned
// ===============================

const getAssignedTickets = async (req, res) => {
    try {
        const where = req.user.role === "ADMIN"
            ? {
                assignedTo: {
                    [Op.ne]: null
                }
            }
            : {
                assignedTo: req.user.id
            };

        const tickets = await Ticket.findAll({
            where,
            include: ticketIncludes,
            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Kiosztott hibajegyek sikeresen lekérve.",
            data: {
                tickets,
                total: tickets.length
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};

// ===============================
// GET /api/tickets/:id
// ===============================

const getTicket = async (req, res) => {
    try {
        const ticketId = parseId(req.params.id);

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen hibajegyazonosító."
            });
        }

        const ticket = await Ticket.findByPk(ticketId, {
            include: ticketIncludes
        });

        if (!ticket || !canViewTicket(req.user, ticket)) {
            return res.status(404).json({
                success: false,
                message: "A hibajegy nem található."
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                ticket
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};


// ===============================
// POST /api/tickets
// ===============================

const createTicket = async (req, res) => {
    try {
        const validation = validateTicket(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const {
            title,
            description,
            roomId,
            categoryId
        } = validation.data;

        const referenceError = await validateReferences(
            roomId,
            categoryId
        );

        if (referenceError) {
            return res.status(400).json({
                success: false,
                message: referenceError
            });
        }

        const ticket = await Ticket.create({
            title,
            description,
            roomId,
            categoryId,
            createdBy: req.user.id,
            assignedTo: null,
            status: "NEW",
            priority: "MEDIUM"
        });

        return res.status(201).json({
            success: true,
            message: "Hibabejelentés sikeresen létrehozva.",
            data: {
                ticket
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};


// ===============================
// PUT /api/tickets/:id
// ===============================

const updateTicket = async (req, res) => {
    try {
        const ticketId = parseId(req.params.id);

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen hibajegyazonosító."
            });
        }

        const ticket = await Ticket.findByPk(ticketId);

        if (!ticket || !canViewTicket(req.user, ticket)) {
            return res.status(404).json({
                success: false,
                message: "A hibajegy nem található."
            });
        }

        // Csak saját hibajegy vagy adminisztrátori módosítás.

        if (
            req.user.role !== "ADMIN" &&
            Number(ticket.createdBy) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: "Ezt a hibajegyet nem módosíthatod."
            });
        }

        // Javítás alatt álló hibajegyet már nem írunk át.

        if (ticket.status !== "NEW") {
            return res.status(409).json({
                success: false,
                message: "Csak új hibajegy szerkeszthető."
            });
        }

        const validation = validateTicket(req.body);

        if (validation.error) {
            return res.status(400).json({
                success: false,
                message: validation.error
            });
        }

        const referenceError = await validateReferences(
            validation.data.roomId,
            validation.data.categoryId
        );

        if (referenceError) {
            return res.status(400).json({
                success: false,
                message: referenceError
            });
        }

        await ticket.update(validation.data);

        return res.status(200).json({
            success: true,
            message: "Hibajegy sikeresen frissítve.",
            data: {
                ticket
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};


// ===============================
// PATCH /api/tickets/:id/assign
// ADMIN
// ===============================

const assignTicket = async (req, res) => {
    try {
        const ticketId = parseId(req.params.id);

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen hibajegyazonosító."
            });
        }

        const { assignedTo } = req.body || {};

        if (
            assignedTo !== null &&
            !parseId(assignedTo)
        ) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen karbantartói azonosító."
            });
        }

        const ticket = await Ticket.findByPk(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "A hibajegy nem található."
            });
        }

        if (
            !["NEW", "ASSIGNED"].includes(ticket.status)
        ) {
            return res.status(409).json({
                success: false,
                message: "Ez a hibajegy már nem osztható ki."
            });
        }

        // null értékkel visszavonható a kiosztás.

        if (assignedTo === null) {
            await ticket.update({
                assignedTo: null,
                status: "NEW"
            });

            return res.status(200).json({
                success: true,
                message: "Hibajegy kiosztása visszavonva.",
                data: { ticket }
            });
        }

        const technician = await User.findByPk(assignedTo);

        if (
            !technician ||
            technician.role !== "TECHNICIAN" ||
            !technician.isActive
        ) {
            return res.status(400).json({
                success: false,
                message: "Aktív karbantartó kiválasztása szükséges."
            });
        }

        await ticket.update({
            assignedTo: technician.id,
            status: "ASSIGNED"
        });

        return res.status(200).json({
            success: true,
            message: "Hibajegy sikeresen kiosztva.",
            data: {
                ticket
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};


// ===============================
// PATCH /api/tickets/:id/status
// TECHNICIAN / ADMIN
// ===============================

const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = parseId(req.params.id);

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen hibajegyazonosító."
            });
        }

        const { status } = req.body || {};

        const allowedStatuses = [
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen hibajegyállapot."
            });
        }

        const ticket = await Ticket.findByPk(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "A hibajegy nem található."
            });
        }

        const isAdmin = req.user.role === "ADMIN";

        const isAssignedTechnician =
            req.user.role === "TECHNICIAN" &&
            Number(ticket.assignedTo) === Number(req.user.id);

        if (!isAdmin && !isAssignedTechnician) {
            return res.status(403).json({
                success: false,
                message: "Nem módosíthatod ezt a hibajegyet."
            });
        }

        // A lezárást kizárólag admin végezheti.

        if (status === "CLOSED" && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Hibajegyet csak adminisztrátor zárhat le."
            });
        }

        // Megengedett állapotváltások

        const transitions = {
            NEW: [],
            ASSIGNED: ["IN_PROGRESS"],
            IN_PROGRESS: ["RESOLVED"],
            RESOLVED: ["CLOSED"],
            CLOSED: []
        };

        const allowedNext = transitions[ticket.status] || [];

        if (!allowedNext.includes(status)) {
            return res.status(409).json({
                success: false,
                message: "Nem megengedett állapotváltás."
            });
        }

        if (!ticket.assignedTo) {
            return res.status(409).json({
                success: false,
                message: "A hibajegyhez nincs karbantartó rendelve."
            });
        }

        const updateData = {
            status
        };

        if (status === "RESOLVED") {
            updateData.resolvedAt = new Date();
        }

        await ticket.update(updateData);

        return res.status(200).json({
            success: true,
            message: "Hibajegy állapota sikeresen módosítva.",
            data: {
                ticket
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};


// ===============================
// PATCH /api/tickets/:id/priority
// ADMIN
// ===============================

const updateTicketPriority = async (req, res) => {
    try {
        const ticketId = parseId(req.params.id);

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen hibajegyazonosító."
            });
        }

        const { priority } = req.body || {};

        const allowedPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ];

        if (!allowedPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Érvénytelen prioritás."
            });
        }

        const ticket = await Ticket.findByPk(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "A hibajegy nem található."
            });
        }

        if (ticket.status === "CLOSED") {
            return res.status(409).json({
                success: false,
                message: "Lezárt hibajegy prioritása nem módosítható."
            });
        }

        await ticket.update({
            priority
        });

        return res.status(200).json({
            success: true,
            message: "Hibajegy prioritása sikeresen módosítva.",
            data: {
                ticket
            }
        });

    } catch (error) {
        return handleTicketError(res, error);
    }
};


module.exports = {
    listTickets,
    getAssignedTickets,
    getTicket,
    createTicket,
    updateTicket,
    assignTicket,
    updateTicketStatus,
    updateTicketPriority
};
