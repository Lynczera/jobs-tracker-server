var express = require('express');
var router = express.Router();

const db = require('../db');
const crypto = require('crypto');


router.post('/create', (req, res) => {
  const {username, password} = req.body;
  var create_user_error = false;

  var query = db.query(`INSERT INTO Users VALUES("${username}")`, (err, rows, fields)=>{

    if (err && err["errno"]==1062 ){
      create_user_error = true;
      res.json({
        user : username,
        error : 1062
      });
      console.log("duplicated");
    }

    if(!err){
      var query = db.query(`INSERT INTO Accounts VALUES("${username}","${password}")`, (err, rows, fields)=>{
        if(err){
          console.log(err["errno"]);
        }

    });
      res.json({
        user : username,
        created : true
      });
    }
    
  });
  })
  
  router.post('/login', (req, res) => {
    const {username, password} = req.body;
    var login_succ = false;

    var query = db.query(`SELECT User FROM Accounts WHERE User="${username}" AND Password = "${password}"`, (err, rows, fields)=>{
      var returnUser = "";
      if(rows[0]){
        returnUser = rows[0].User;
        login_succ = true;
      }
      
      if(returnUser === username){
        const userSession = crypto.randomUUID();

        //add session to db
        var sessionQuery = db.query(`INSERT INTO Sessions(User,sID) VALUES("${username}","${userSession}")`, (err, rows, fields)=>{
          if(err){
            console.log(err["errno"]);
          }
        });
        
        res.cookie('sID', userSession, {
          httpOnly: true,
          // secure: true
        });

        res.json({
          user : username,
          login : login_succ
        });

        // res.send(`${username} logged successfuly`);
      }else{
        res.json({
          user : username,
          login : false
        });
      }
    });



  });


  router.get('/auth', (req, res) => {

    const sID = req.cookies.sID;

    var checkSession = db.query(`SELECT sID,User FROM Sessions WHERE sID = "${sID}"`, (err, rows, fields)=>{

    if (err){
      console.log(err);
    }else{
      if(rows[0]){
        res.json({
          auth: true,
          user: rows[0].User
        });
      }else{
        res.json({
          auth: false
        });
      }
      
    }
    })

  });

  router.get("/logout", (req, res)=>{
    const sID = req.cookies.sID;
    var deleteSession = db.query(`DELETE FROM Sessions WHERE sID="${sID}"`, (err,rows, fields)=>{
      if(err){
          res.json({
            logout : false
          });
          console.log(err);
      }
      else{
        res.clearCookie("sID");
        res.json({
          logout : true
        });
      }
    })

  });


module.exports = router;