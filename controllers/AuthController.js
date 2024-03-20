const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const MongoUtil = require('../utils/db');
const RedisUtil = require('../utils/redis');

// GET /connect endpoint
const connect = async (req, res) => {
  const authHeader = req.header.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString();
  const [email, password] = credentials.split(':');

  try {
    const user = await MongoUtil.findUser(email);
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    await RedisUtil.redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 24 * 60 * 60);

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const disconnect = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await RedisUtil.redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await RedisUtil.redisClient.del(`auth_${token}`);
  return res.status(204).end();
};

module.exports = {
  connect,
  disconnect,
};
