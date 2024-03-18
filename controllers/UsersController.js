const sha1 = require('../node_modules/sha1');
const dbclient = require('../utils/db')
const redis = require('redis');

class UsersController {
  // Post /users endpoint
  // static async postNew = async (req, res) => {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate Email and Password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if user already exists
    try{
      const user = await dbClient.getUserByEmail(email);
      if (user) {
        return res.status(400).json({ error: 'Already exist' });
      }
    
    // Create the new user with a hashed password
    const newUser = {
      email,
      password: sha1(password), // Hashes the password
    };

    // Save the new user to the database 'users'
    const result = await dbClient.createUser(newUser);

    // Return the new user's email and id
    return res.status(201).json({ email: savedUser.email, id: savedUser._id });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

  // GET /users/me endpoint
  static async getMe(req, res) {
    // Get the token from the request headers
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    // Check if the user is authorized
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Get the user from the database
    const user = await dbClient.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user's email and id
    return res.status(200).json({ email: user.email, id: user._id });
  };
}

// its a class now so we can just export that
// module.exports = {
//   postNew,
//   getMe
// };
module.exports = UsersController;
