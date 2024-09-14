const router = require("express").Router();
const path = require('path')

router.get("/", async (req, res) => {
  res.download(path.join(process.env.BASE_API_URL, 'uploads', 'output.xlsx'));
});

module.exports = router;
