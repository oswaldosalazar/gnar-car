var express = require('express');
var router = express.Router();
var users = require('../database/user');
var rides = require('../database/ride');
var cars = require('../database/car');
var passport = require('../passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:username/rides', function(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect('/');
  var user = req.user;
  var isLoggedIn = true;

  res.render('rides',
    {title: user.username + ' | Rides', user: user, loggedIn: isLoggedIn});
});

router.post('/:username/rides/:rideID/delete', function(req, res, next){
  if (!req.isAuthenticated()) return res.redirect('/');
  var username = req.user.username;
  var rideID = req.params.rideID;
  var userID;
  users.findUser(username)
  .then(function(userData){
    userID = userData[0].id;
    rides.deleteRiderInRide(userID,rideID)
    .then(function(){
      res.redirect('/rides');
    });
  });
});

router.get('/:username', function(req, res, next) {
  var username = req.params.username;
  var rating;
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  var user = req.user;
  var isLoggedIn = true;
  var loggedInUser = false;
  if (username === user.username) {
    loggedInUser = true;
  }
  users.findUser(username)
  .then(function(userData) {
    var userID = userData[0].id;
    rides.getRideDataByUserID(userID)
    .then(function(rideData) {
      users.getUserRating(userID)
      .then(function(rating) {
        rating = Math.floor(rating.avg);
        res.render('profile',
          {rideData: rideData,
            userData: userData,
            loggedInUser: loggedInUser,
            loggedIn: isLoggedIn,
            user: user,
            rating: rating});
      });
    });
  });
});

router.get('/:username/edit', function(req, res, next) {
  var username = req.params.username;
  if (!req.isAuthenticated()) return res.redirect('/');
  if (req.user.username !== username) return res.redirect('/');

  var msg = false;
  if (req.flash()) msg = req.flash();

  var car;
  users.findCarByUser(req.user.id).then(function(data) {
    car = data[0];
    var user = req.user;
    var isLoggedIn = true;
    res.render('edit',
      {title: username + 'edit', user: user, car: car, loggedIn: isLoggedIn, msg: msg});
  });

});

router.post('/:username/edit', function(req, res, next) {
  var usernameParam = req.params.username;
  var update = req.body;

  var userId = update.id;
  var username = update.username;
  var password = update.password;
  var phone = update.phone;
  var email = update.email;
  var address = update.address;
  var city = update.city;
  var state = update.state;
  var zip = update.zipcode;

  if (!userId || !username || !phone || !email ||
      !address || !city || !state || !zip) {
    req.flash('usererror', 'One or more fields blank');
    return res.redirect('/users/' + usernameParam + '/edit');
  }

  users.updateUser(userId, username, phone, email, address, city, state, zip)
    .then(function(data) {
      req.flash('usersuccess', 'Profile successfully updated');
      req.login(update, function(err) {
        if (err) return next(err);
        return res.redirect('/users/' + req.user.username + '/edit');
      })
    });
});
module.exports = router;
