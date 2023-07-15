const Movie = require('../models/movie');
const { NOT_FOUND, CREATED, FORBIDDEN } = require('../constants/errorStatuses');

exports.getSavedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find();
    return res.json(movies);
  } catch (error) {
    return next(error);
  }
};

exports.createMovie = async (req, res, next) => {
  const { name, link } = req.body;
  try {
    const movie = await Movie.create({ name, link, owner: req.user._id });
    return res.status(CREATED).json(movie);
  } catch (error) {
    return next(error);
  }
};

exports.deleteMovie = async (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(NOT_FOUND).json({ message: 'Фильм не найден' });
    }

    if (movie.owner.toString() !== _id) {
      return res
        .status(FORBIDDEN)
        .json({ message: 'Нет прав на удаление фильма' });
    }

    await Movie.findByIdAndDelete(movieId);

    return res.json({ message: 'Фильм удалён' });
  } catch (error) {
    return next(error);
  }
};
