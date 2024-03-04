var express = require('express');
var router = express.Router();

const db = require('../db');

router.post('/create', (req, res) => {
  const {username} = req.body;

  var query = db.query(`INSERT INTO Users VALUES("${username}")`, (err, rows, fields)=>{
    if (err){
      console.log(err);
    }
    // console.log(query);
    
  })

    res.json({
      user : username,
      created : true
    });
  })
  
module.exports = router;