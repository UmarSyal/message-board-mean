const jwt = require('jsonwebtoken');

const authConfigs = require('../configs/auth.configs');

module.exports = (req, res, next) => {
  // expected auth token format -> 'Bearer {token}'
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, authConfigs.jwt_secret);
    next();
  } catch(error) {
    res.status(401).json({
      message: 'Authorization denied',
    });
  }
};
