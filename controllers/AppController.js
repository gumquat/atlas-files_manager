const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  // GET /status endpoint
  static async getStatus (req, res) {
      // Check if Redis is alive
      const redisAlive = await redisClient.isAlive();
      // Check if MongoDB is alive
      const dbAlive = await dbClient.isAlive();
      // Send a JSON response with the status of Redis and MongoDB
      return res.status(200).json({ redis: redisAlive, db: dbAlive });
  };

  // GET /stats endpoint  
  static async getStats(req, res){
    // Get the count of users from the 'users' collection
    const users = await dbClient.countUsers();
    // Get the count of files from the 'files' collection
    const files = await dbClient.countFiles();
    // Send a JSON response with the user and file counts
    return res.status(200).json({ users, files });
  };
}

// module.exports = {
//   getStatus,
//   getStats,
// };
module.exports = AppController;