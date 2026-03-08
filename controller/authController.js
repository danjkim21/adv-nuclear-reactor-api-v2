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

exports.updateUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { email, organization, password } = req.body;
  const updates = {};

  if (email !== undefined) updates.email = email;
  if (organization !== undefined) updates.organization = organization;
  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' });
    }
    updates.password = password;
  }

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ error: 'No valid fields provided to update' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    Object.assign(user, updates);
    await user.save();
    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ user: safeUser });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }
    res.status(500).json({ error: 'Error updating user' });
  }
};

exports.updateUserPermissions = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'User is not permitted to perform this operation' });
  }
  const { role, verified } = req.body;
  const updates = {};

  if (role !== undefined) updates.role = role;
  if (verified !== undefined) updates.verified = verified;
  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ error: 'No valid fields provided to update' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' },
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error updating user' });
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
