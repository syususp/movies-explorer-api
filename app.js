/* eslint-disable no-console */
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { celebrate, Joi, Segments, errors } = require('celebrate');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes/index');
const { NOT_FOUND } = require('./constants/errorStatuses');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NODE_ENV, DB_URL } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

mongoose
  .connect(
    `${
      NODE_ENV === 'production' ? DB_URL : 'mongodb://127.0.0.1:27017'
    }/bitfilmsdb`,
    {
      useNewUrlParser: true,
    },
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(requestLogger);

app.post(
  '/signin',
  celebrate({
    [Segments.BODY]: Joi.object()
      .keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      })
      .unknown(true),
  }),
  login,
);

const linkValidation = (value, helpers) => {
  if (value.startsWith('link:')) {
    return helpers.error('any.invalid');
  }
  return value;
};

app.post(
  '/signup',
  celebrate({
    [Segments.BODY]: Joi.object()
      .keys({
        name: Joi.string().min(2).max(30),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        avatar: Joi.string().custom(linkValidation),
        about: Joi.string().min(2).max(30),
      })
      .unknown(true),
  }),
  createUser,
);

app.use(auth);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: 'Ошибка запроса' });
});

app.listen(3000);
