require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const cors = require("cors");

//COrs
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to handle URL-encoded form data

// const connectDB = require("./config/db");
// connectDB();



//Template Engine
app.set("views", path.join(__dirname + "/views"));
app.set("view engine", "ejs");
app.get('/', (req, res, next) => {
  res.status(200).json({ msg: "listening" })
})

app.use("/api/files", require("./routes/files"));
app.use("/api/download", require("./routes/download"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
