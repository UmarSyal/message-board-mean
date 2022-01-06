const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // expected auth token format -> 'Bearer {token}'
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userInfo = { email: decodedToken.email, id: decodedToken.userId };
    next();
  } catch(error) {
    res.status(401).json({
      message: 'Authorization denied',
    });
  }
};
