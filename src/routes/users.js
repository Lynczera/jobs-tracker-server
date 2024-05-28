const { Prisma, PrismaClient } = require('@prisma/client')

var express = require('express');
var router = express.Router();

require('dotenv').config()
const { createHmac } = require('node:crypto');

const prisma = new PrismaClient()

const jwt_auth = require('../middleware/jwtAuth');
const { jwtAuth } = require('../middleware/jwtAuth');

router.post("/create", async (req, res) => {
  const { username, password } = req.body;
  const hash = createHmac('sha256', process.env.HASHING_SECRET)
    .update(password)
    .digest('hex');

  try {
    const user = await prisma.user.create({
      data: {
        name: username,
        password: hash
      },
    })

    if (user) {

      res.json({
        user: user.name,
        created: true,
      })
    }


  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      //username already exists
      if (e.code === 'P2002') {
        res.json({
          user: username,
          error: 1062,
        });
      }
    } else {
      throw e
    }
  }

});

TODO: //remember to redirect user if goes back to login page after login ?????
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const hash = createHmac('sha256', process.env.HASHING_SECRET)
    .update(password)
    .digest('hex');

  const get_user = await prisma.user.findUnique({
    where: {
      name: username,
      password: hash
    }
  })

  if (get_user) {
    //set user cookie
    delete get_user.password
    const token = jwtAuth.sign(get_user);
    res.cookie("token", token, {
      httpOnly: true
    })

    res.json({
      user: username,
      login: true
    })
  }
  else {
    res.json({
      user: username,
      login: false
    })
  }

});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    logout: true
  });
})

router.get("/auth", (req, res) => {
  const token = req.cookies.token;
  const verify = jwtAuth.verify(req, res, token);
  var user = null
  if (verify) {
    user = jwtAuth.decode(token).name
  }
  res.json({
    auth: verify,
    user: user
  })
});
module.exports = router;
