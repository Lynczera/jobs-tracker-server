var express = require('express');
var router = express.Router();

router.post("/create", (req, res)=>{ 
const {username, password} = req.body;
  console.log(username)
  console.log(password)
});

router.get("/login", (req, res)=> {
res.send("user route accessed")
});

module.exports = router;
