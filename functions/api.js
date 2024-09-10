const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();
const path = require("path");
const cors = require("cors");
const NETLIFY_PATH = '/.netlify/functions/api'

router.get('/', (req, res) => {
	res.send('App is running..');
});

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
router.get('/', (req, res, next) => {
	res.status(200).json({ msg: "listening" })
})

app.use(NETLIFY_PATH + "/api/files", require("../routes/files"));
app.use(NETLIFY_PATH + "/files", require("../routes/show"));
app.use(NETLIFY_PATH + "/files/download", require("../routes/download"));




app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
