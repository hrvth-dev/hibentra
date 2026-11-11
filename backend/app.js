const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());





app.listen(5000 || process.env.PORT, () => {
console.log("Elidult a szerver!")
});