const redis = require('redis');
const { promisify } = require('util');
class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.log(`Redis Client Error: ${err}`);
    });
    // these are commented out because redis 2.8.0 automatically
    // attempts to connect to the server upon creation
    // this.client.connect();
    // this.client.connected = true;
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, duration) {
    const asyncSet = promisify(this.client.setex).bind(this.client);
    return asyncSet(key, duration, value);
  }

  async del(key) {
    const asyncDel = promisify(this.client.del).bind(this.client);
    return asyncDel(key);
  }
}


const redisClient = new RedisClient();
module.exports = redisClient;
