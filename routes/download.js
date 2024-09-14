const router = require("express").Router();
const path = require('path');
const { processFile } = require("../controller/apply-filter");

router.post("/:name", async (req, res) => {
  console.log("PARAM", req.params, req.body)
  const filters = req.body
  processFile(path.join(process.env.BASE_API_URL, 'uploads', req.params.name), filters)
  res.status(200).download(path.join(process.env.BASE_API_URL, 'uploads', 'output.xlsx'));
});

module.exports = router;
