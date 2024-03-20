const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const dbUtil = require('../utils/db');
const redisUtil = require('../utils/redis');

// GET /connect endpoint
class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString();
    const [email, password] = credentials.split(':');

    const user = await dbUtil.findUser(email);
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    try {
      await redisUtil.set(`auth_${token}`, user._id.toString(), 'EX', 24 * 60 * 60);
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error setting token in Redis:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisUtil.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisUtil.del(`auth_${token}`);
    return res.status(204);
  }
}

// module.exports = {
//   connect,
//   disconnect,
// };
module.exports = AuthController;
