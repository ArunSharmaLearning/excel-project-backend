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
  "myfile"
);

router.get("/test", (req, res) => {

  res.status(200).send("HELLO WORLD")

})

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    const filters = req.body;
    filters.includePhoneNo = JSON.parse(filters.includePhoneNo);
    processFile(path.join(process.env.BASE_API_URL, req.file.path), filters)
    res.json({
      file: path.join(process.env.BASE_API_URL, 'uploads', 'output.xlsx')
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
