const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('../constants/errorStatuses');

const { NODE_ENV, JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  const tokenString = req.headers.cookie || req.headers.authorization;
  let token;
  if (!tokenString) {
    return res
      .status(UNAUTHORIZED)
      .json({ message: `Ошибка авторизации: токен ${tokenString}` });
  }

  if (tokenString.startsWith('token=')) {
    token = tokenString.replace('token=', '');
  }

  if (tokenString.startsWith('Bearer ')) {
    token = tokenString.replace('Bearer ', '');
  }
  try {
    const payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'super-secret-key',
    );
    req.user = payload;
    return next();
  } catch (error) {
    return res
      .status(UNAUTHORIZED)
      .json({ message: `Ошибка авторизации: ${error}` });
  }
};

module.exports = auth;
