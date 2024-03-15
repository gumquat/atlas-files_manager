const MongoUtil = require('../utils/MongoUtil');
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

module.exports = {
  postNew,
};
