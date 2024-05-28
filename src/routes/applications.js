var express = require("express");
var router = express.Router();
const { cheerio_wrapper } = require("../webscrap/cheerio_wrapper")
const { jwtAuth } = require('../middleware/jwtAuth');

router.post("/add_app", async (req, res) => {
  const token = req.cookies.token;
  const { jID, date, status } = req.body;

  if (jwtAuth.verify(req, res, token)) {

    const website = `https://www.linkedin.com/jobs/view/${jID}`;
    var job = await cheerio_wrapper.get_job(website);
    console.log(job)
  }
});

router.get("/apps", async (req, res) => {
});

router.post("/update_app", (req, res) => {
});

module.exports = router;
