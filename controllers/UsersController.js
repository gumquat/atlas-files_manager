// Import the dbClient and redisClient
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const sha1 = require('../node_modules/sha1');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;


    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = {
      email,
      password: hashedPassword,
    };

    const savedUser = await dbClient.createUser(newUser);
    return res.status(201).json({ email: savedUser.email, id: savedUser._id });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ email: user.email, id: user._id });
  }
}

module.exports = UsersController;
