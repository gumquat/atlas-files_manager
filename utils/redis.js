const redis = require('redis');
class RedisClient {
constructor() {
  this.client = redis.createClient();
  this.client.on('error', (err) => {
    console.log('Redis Client Error', err);
  });
  this.client.connect();
}

isAlive() {
  return this.client.isOpen;
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
  return new Promise((resolve, reject) => {
    this.client.setEx(key, duration, value, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
}

async del(key) {
  return new Promise((resolve, reject) => {
    this.client.del(key, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
}
}

const redisClient = new RedisClient();
module.exports = redisClient;