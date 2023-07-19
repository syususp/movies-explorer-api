const express = require('express');
const userRoutes = require('./users');
const movieRoutes = require('./movies');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/movies', movieRoutes);

module.exports = router;
