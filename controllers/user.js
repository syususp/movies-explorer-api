const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  UNAUTHORIZED,
  CREATED,
  BAD_REQUEST,
} = require('../constants/errorStatuses');

const { NODE_ENV, JWT_SECRET } = process.env;

exports.createUser = async (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    user.password = undefined;
    return res.status(CREATED).json(user);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(BAD_REQUEST).json({ message: error.message });
    }
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: 'Неправильные почта или пароль' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: 'Неправильные почта или пароль' });
    }

    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'super-secret-key',
      {
        expiresIn: '7d',
      },
    );

    return res
      .cookie('token', token, { httpOnly: true, secure: true, sameSite: true })
      .json({ token });
  } catch (error) {
    return next(error);
  }
};

exports.getUserInfo = async (req, res, next) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

exports.updateUserInfo = async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true },
    );
    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};
