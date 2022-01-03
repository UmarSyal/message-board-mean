const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(passwordHash => {
    const user = new User({
      email: req.body.email,
      password: passwordHash
    });
    user.save()
      .then(user => {
        res.status(201).json({
          message: "User created!",
          user: user
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "User not created!",
          error: err
        });
      });
  });
});

module.exports = router;
