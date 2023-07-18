/* eslint-disable no-console */
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {
  celebrate,
  Joi,
  Segments,
  errors,
} = require('celebrate');
const helmet = require('helmet');
const limiter = require('./middlewares/limiter');
const routes = require('./routes/index');
const { NOT_FOUND } = require('./constants/errorStatuses');
const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NODE_ENV, DB_URL } = process.env;

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

app.post(
  '/signup',
  celebrate({
    [Segments.BODY]: Joi.object()
      .keys({
        name: Joi.string().min(2).max(30),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
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

app.post('/signout', (req, res) => {
  // res.cookie('token', '').json({ message: 'Выход из учётной записи успешен' });
  res.clearCookie('token').json({ message: 'Выход из учётной записи успешен' });
});

app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: 'Ошибка запроса' });
});

app.listen(3000);
