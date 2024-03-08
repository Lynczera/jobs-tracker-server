var express = require("express");
var router = express.Router();

const cheerio = require("cheerio");
const axios = require("axios");

const axiosRetry = require("axios-retry").default;
axiosRetry(axios, {
  retries: 10,
  retryCondition(error) {
    switch (error.response.status) {
      case 429:
        return true;
      default:
        return false;
    }
  },
});

const db = require("../db");

router.post("/add_app", async (req, res) => {
  const sID = req.cookies.sID;
  const { jID, date, status } = req.body;

  const saveJob = "3847078208";
  const website = `https://www.linkedin.com/jobs/view/${jID}`;

  axios(website)
    .then((page) => {
      const data = page.data;
      const $ = cheerio.load(data);

      let content = [];
      $(".top-card-layout__title", data).each(function () {
        const title = $(this).text();

        content.push(title);
      });

      $(".topcard__org-name-link", data).each(function () {
        const compName = $(this)
          .text()
          .replace(/^\s*(.*?)\s*$/, "$1");

        content.push(compName);
      });

      console.log(content);
      res.json({
        title: content[0],
        company: content[1],
      });

      var query = db.query(
        `INSERT INTO Applications(
                JobID,DateApplied,Title,Company,Status,User
                ) Values (
                "${jID}",
                '${date.toString().split("T")[0]}',
                "${content[0]}",
                "${content[1]}",
                "${status}",
                (SELECT User FROM Sessions WHERE sID="${sID}")
            )`,
        (err, rows, fields) => {
          if (err) {
          } else {
            console.log("application added");
          }
        }
      );
    })
    .catch((error) => {
      console.log(error.toJSON());
      
      if(error.toJSON()["status"] == 429){
        console.log("ERROR FOUND SENDING TO CLIENT");
      }else{
        res.json({
            title:null,
            company:null
          });
      }

    });
});

router.get("/apps", async (req, res) => {
  const sID = req.cookies.sID;
  const apps = [];

  var query = db.query(
    `SELECT * FROM Applications NATURAL JOIN Sessions WHERE SID = "${sID}" `,
    (err, rows, fields) => {
      rows.forEach((element) => {
        apps.push({
          JobID: element.JobID,
          Date: element.DateApplied,
          Title: element.Title,
          Company: element.Company,
          Status: element.Status,
        });
      });
      res.json(apps);
    }
  );
});

router.post("/remove", async (req, res) => {
  const { apps } = req.body;
  const refactor_apps = apps.map((ele) => `"${ele}"`);

  var query = db.query(
    `DELETE FROM Applications WHERE JobID IN (${refactor_apps.toString()}) `,
    (err, rows, fields) => {
      if (err) {
        console.log(err);
        res.send("error");
      } else {
        res.send("removed");
      }
    }
  );
});

module.exports = router;
