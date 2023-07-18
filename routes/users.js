const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const { updateUserInfo, getUserInfo } = require('../controllers/user');

const router = express.Router();

router.get(
  '/me',
  celebrate({
    [Segments.HEADERS]: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
  }),
  getUserInfo,
);

router.patch(
  '/me',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(2).max(30).required(),
    }),
  }),
  updateUserInfo,
);

module.exports = router;
