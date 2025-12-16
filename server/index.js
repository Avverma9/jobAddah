require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");
import router from "./routes/index.js";

const app = express();

connectDB();


app.use(cors({ origin: "*", credentials: false }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));


app.use("/api/v1",router );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});
