const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");
const { processFile } = require("../controller/apply-filter");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({ storage, limits: { fileSize: 1000000 * 100 } }).single(
  "file"
);

router.get("/test", (req, res) => {
  res.status(200).send("HELLO WORLD")
})

router.post("/", (req, res) => {
  console.log("REQ", req.file, req.body)
  upload(req, res, async (err) => {
    console.log("REQ2", req.file, req.body)
    if (!req.file) {
      return res.json({ error: "All fields are required!!!!" });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }
    console.log("REACHED", req.file.path)
    res.json({
      file: req.file.filename
    });
  });
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required." });
  }

  const file = await File.findOne({ uuid: uuid });
  if (file.sender) {
    return res.status(422).send({ error: "Email already sent once." });
  }
  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();
  // send mail
  const sendMail = require("../services/emailService");
  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "Drop it",
    text: `${emailFrom} shared a file with you.`,
    html: require("../services/emailTemplate")({
      emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
      size: parseInt(file.size / 1000) + " KB",
      expires: "24 hours",
    }),
  });
  return res.json({ success: true });
});

module.exports = router;
