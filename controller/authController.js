const User = require('../models/User');

exports.getCurrentUser = (req, res) => {
  console.log('current user: ', req.user);
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
};

exports.checkAlreadyRegistered = async (req, res, next) => {
  const { username } = req.body;
  const registered = await User.find({ username });
  if (registered[0] && registered[0]._id) {
    res.json({ error: `Sorry, already a user with the username: ${username}` });
    return;
  }
  next();
};

exports.registerUser = async (req, res, next) => {
  const { username, password } = req.body;
  await new User({ username, password }).save();
  next();
};

exports.login = (req, res) => {
  req.login(req.user, function (err) {
    if (err) {
      res.json({ error: err });
    }
    return res.send(req.user);
  });
};

exports.logout = (req, res) => {
  if (req.user) {
    req.logout();
    res.send({ msg: 'logged out' });
  } else {
    res.send({ msg: 'no user to log out' });
  }
};
