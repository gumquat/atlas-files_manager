const MongoUtil = require('../utils/MongoUtil');
const RedisUtil = require('../utils/RedisUtil');
const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const atob = require('atob');

// GET /connect endpoint
const connect = async (req, res) => {
  const authHeader = req.header.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials);
  const [email, password] = credentials.split(':');

  const user = await MongoUtil.findUser(email);
  if (!user || user.password !== sha1(password)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuidv4();
  await RedisUtil.redisClient.set(`auth_${token}`, user._id.toString(), EX, 24 * 60 *60);

  res.status(200).json({ token });
};

const disconnect = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await RedisUtil.redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await RedisUtil.redisClient.del(`auth_${token}`);
  res.status(204).end();
};

module.exports = {
  connect,
  disconnect,
};
