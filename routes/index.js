var express = require('express');
var router = express.Router();
var validator = require('validator');
var users = require('../database/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'GnarCar'});
});

router.get('/signup', function(req, res, next) {
  var msg = false;
  if (req.flash) msg = req.flash();
  res.render('signup', {title: 'Sign Up', msg: msg});
});

router.post('/signup', function(req, res, next) {
  var formVars = req.body;

  var errors = false;
  var username = formVars.username;
  var email = formVars.email;
  var password = formVars.password;
  var confirm = formVars.confirm;

  if (!username || !email || !password || !confirm) return false;

  if (!validator.isEmail(email)) {
    req.flash('email', email);
    errors = true;
  }

  if (password !== confirm) {
    req.flash('password', true);
    errors = true;
  }

  if (!validator.isAlphanumeric(username) ||
    (username.length < 5 || username.length > 20)
  ) {
    req.flash('username', username);
    errors = true;
  }

  if (errors) {
    res.redirect('/signup');
    return;
  }

  users.addUser(username, email, password)
  .then(function(){
    res.redirect('/rides');
  });
});

module.exports = router;
