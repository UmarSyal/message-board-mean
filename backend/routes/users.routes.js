const express = require('express');

const usersController = require('../controllers/users.controller');

const router = express.Router();

router.post('/signup', usersController.userSignup);

router.post('/login', usersController.userLogin);

module.exports = router;
