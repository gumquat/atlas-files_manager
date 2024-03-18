const RedisUtil = require('../utils/RedisUtil');
const MongoUtil = require('../utils/MongoUtil');

// GET /status endpoint
const getStatus = async (req, res) => {
  try {
    // Check if Redis is alive
    const redisAlive = await RedisUtil.isAlive();
    // Check if MongoDB is alive
    const dbAlive = await MongoUtil.isAlive();
    // Send a JSON response with the status of Redis and MongoDB
    res.status(200).json({ redis: redisAlive, db: dbAlive });
  } catch (error) {
    // Log the error to the console
    console.error('Error getting status:', error);
    // Send an Internal Server Error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /stats endpoint
const getStats = async (req, res) => {
  try {
    // Get the count of users from the 'users' collection
    const users = await MongoUtil.countUsers();
    // Get the count of files from the 'files' collection
    const files = await MongoUtil.countFiles();
    // Send a JSON response with the user and file counts
    res.status(200).json({ users, files });
  } catch (error) {
    // Log the error to the console
    console.error('Error getting stats:', error);
    // Send an Internal Server Error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getStatus,
  getStats,
};