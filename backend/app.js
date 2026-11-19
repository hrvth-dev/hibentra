"use strict";

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("../backend/routes/authRoutes");
const adminRoutes = require("../backend/routes/adminRoutes");
const userRoutes = require("../backend/routes/userRoutes");

const roomRouters = require("../backend/routes/roomRoutes");
const categoryRouters = require("../backend/routes/categoryRoutes");

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes )


app.use("/api/rooms", roomRouters);
app.use("/api/category", categoryRouters);

app.listen(5000 || process.env.PORT, () => {
    console.log("Elidult a szerver!")
});