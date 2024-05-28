var express = require("express");
var router = express.Router();
const { cheerio_wrapper } = require("../webscrap/cheerio_wrapper")
const { jwtAuth } = require('../middleware/jwtAuth');
const { Prisma, PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.post("/add_app", async (req, res) => {
  const token = req.cookies.token;
  const { jID, date, status } = req.body;

  if (jwtAuth.verify(req, res, token)) {

    const website = `https://www.linkedin.com/jobs/view/${jID}`;
    var job = await cheerio_wrapper.get_job(website);

    const user = jwtAuth.decode(token).name
    try {
      const app = await prisma.application.create({
        data: {
          title: job.title,
          company: job.company,
          jobID: jID,
          status: status,
          user: user,
          dateApplied: (new Date(date.toString().split("T")[0])).toISOString()
        },
      })

      if (app) {
        res.json({
          title: job.title,
          company: job.company,
        });
      }

    } catch (e) {
      console.log(e)
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        //duplicated application already exists
        if (e.code === 'P2002') {
          res.json({
            title: null,
            company: null,
          });

        }
      }
    }
  }
});

router.get("/apps", async (req, res) => {

  const token = req.cookies.token;

  if (jwtAuth.verify(req, res, token)) {

    const user = jwtAuth.decode(token).name
    const apps = await prisma.application.findMany({
      where: {
        user: user
      }
    })

    if (apps) {
      const sanitize_app = apps.map(app => ({
        Title: app.title,
        JobID: app.jobID,
        Company: app.company,
        Status: app.status,
        User: app.user,
        Date: app.dateApplied
      }));
      res.json(sanitize_app)
    }
  } else {
    res.send("unauthorized")
  }
});

router.post("/update_app", async (req, res) => {

  const { job, status } = req.body
  const token = req.cookies.token;

  if (jwtAuth.verify(req, res, token)) {

    const user = jwtAuth.decode(token).name
    try {
      const updateApp = await prisma.application.update({
        where: {
          jobID: job,
          user: user

        }, data: {
          status: status
        }

      })

      if (updateApp) {
        res.send("updates")
      }

    } catch (e) {
      console.log(e)
    }

  } else {
    res.send("unauthorized")
  }
});

module.exports = router;
