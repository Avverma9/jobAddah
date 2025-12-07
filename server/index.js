require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");

const app = express();

connectDB();


app.use(cors({ origin: "*", credentials: false }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));


app.use("/api/v1", require("./routes/index"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
