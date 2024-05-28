
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')
var app = express()
var cookieParser = require('cookie-parser');
const port = 3000

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var usersRouter = require('./src/routes/users');
var appsRouter = require('./src/routes/applications');

app.use('/users', usersRouter);
app.use('/applications', appsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

module.exports = app;
