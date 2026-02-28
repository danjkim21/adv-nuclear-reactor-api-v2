const User = require('../models/User');

exports.getCurrentUser = (req, res) => {
  if (req.user) {
    const { password, ...safeUser } = req.user.toObject();
    res.json({ user: safeUser });
  } else {
    res.json({ user: null });
  }
};

exports.getAllUsers = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'User is not permitted to perform this operation' });
  }
  try {
    const users = await User.find({}, '-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.checkAlreadyRegistered = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    if (
      !username ||
      typeof username !== 'string' ||
      username.trim().length === 0
    ) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const query = email ? { $or: [{ username }, { email }] } : { username };
    const registered = await User.findOne(query);
    if (registered) {
      res.json({
        error: `Sorry, already a user with the username: ${username}`,
      });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration check' });
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { username, password, email, organization } = req.body;
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' });
    }
    await new User({ username, password, email, organization }).save();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

exports.login = (req, res) => {
  req.login(req.user, function (err) {
    if (err) {
      return res.status(500).json({ error: err });
    }
    const { password, ...safeUser } = req.user.toObject();
    return res.json(safeUser);
  });
};

exports.logout = (req, res) => {
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error logging out' });
      }
      res.json({ msg: 'logged out' });
    });
  } else {
    res.json({ msg: 'no user to log out' });
  }
};
