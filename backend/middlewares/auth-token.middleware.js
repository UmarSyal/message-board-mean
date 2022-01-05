const jwt = require('jsonwebtoken');

const authConfigs = require('../configs/auth.configs');

module.exports = (req, res, next) => {
  // expected auth token format -> 'Bearer {token}'
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, authConfigs.jwt_secret);
    req.userInfo = { email: decodedToken.email, id: decodedToken.userId };
    next();
  } catch(error) {
    res.status(401).json({
      message: 'Authorization denied',
    });
  }
};
