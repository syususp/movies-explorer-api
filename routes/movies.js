const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const {
  getSavedMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movie');

const router = express.Router();

const linkValidation = (value, helpers) => {
  if (value.startsWith('link:')) {
    return helpers.error('any.invalid');
  }
  return value;
};

router.get(
  '/',
  celebrate({
    [Segments.HEADERS]: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
  }),
  getSavedMovies,
);

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
      image: Joi.string().required().custom(linkValidation),
      trailerLink: Joi.string().required().custom(linkValidation),
      thumbnail: Joi.string().required().custom(linkValidation),
      owner: Joi.string().required(),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

router.delete(
  '/:id',
  celebrate({
    [Segments.HEADERS]: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
