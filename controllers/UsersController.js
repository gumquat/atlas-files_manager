const MongoUtil = require('../utils/MongoUtil');
const RedisUtil = require('../utils/RedisUtil');
const sha1 = require('sha1');

// Post /users endpoint
const postNew = async (req, res) => {
  const { email, password } = req.body;

  // Validate Email and Password
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  // Check if user already exists
  const user = await MongoUtil.findUser(email);
  if (user) {
    return res.status(400).json({ error: 'Already exist' });
  }
  
  // Create the new user with a hashed password
  const newUser = {
    email,
    password: sha1(password), // Hash the password
  };

  // Save the new user to the database
  const result = await MongoUtil.createUser(newUser);

  // Return the new user's email and id
  res.status(201).json({ email: result.email, id: result._id });
};

// GET /users/me endpoint
const getMe = async (req, res) => {
  // Get the token from the request headers
  const token = req.headers['x-token'];
  const userId = await RedisUtil.redisClient.get(`auth_${token}`);

  // Check if the user is authorized
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the user from the database
  const user = await MongoUtil.findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Return the user's email and id
  res.status(200).json({ email: user.email, id: user._id });
};

module.exports = {
  postNew,
  getMe
};
