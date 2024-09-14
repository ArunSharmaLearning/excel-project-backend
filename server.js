require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const cors = require("cors");
const serverless = require("serverless-http");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to handle URL-encoded form data

// const connectDB = require("./config/db");
// connectDB();

//COrs
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

//Template Engine
app.set("views", path.join(__dirname + "/views"));
app.set("view engine", "ejs");
app.get('/', (req, res, next) => {
  res.status(200).json({ msg: "listening" })
})

app.use("/api/files", require("./routes/files"));
app.use("/api/files/download", require("./routes/download"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
