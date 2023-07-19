const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const {
  getSavedMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movie');

const router = express.Router();

const linkRegex = /^https?:\/\/(w{3}\.)?[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;

router.get('/', getSavedMovies);

router.post(
  '/',
  celebrate({
    [Segments.HEADERS]: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    [Segments.BODY]: Joi.object({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().pattern(linkRegex),
      trailerLink: Joi.string().required().pattern(linkRegex),
      thumbnail: Joi.string().required().pattern(linkRegex),
      owner: Joi.string().required(),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

router.delete(
  '/:movieId',
  celebrate({
    [Segments.HEADERS]: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    [Segments.PARAMS]: Joi.object({
      movieId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
