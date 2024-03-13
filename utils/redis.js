//Import redis module
const redis = require('redis');

//Define redis class that creates a new Redis client
class RedisClient {
constructor() {
  //This makes a new redis client
  this.client = redis.createClient();
  //Event listener for catching errors
  this.client.on('error', (err) => {
    console.log('Redis Client Error', err);
  });
  //Conect to the Redis Server
  this.client.connect();
}
//Returns true is the Redis client is open+connected, false otherwise
isAlive() {
  return this.client.isOpen;
}
//get(key) method returns a Promise that resolves w/ the value stored in Redis
// for the given key, or rejects with an error
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
//Set(...) method returns a Promise that resolves after setting the
//'value' for the given 'key', or rejects w/ and error
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
//del(key) method returns a Promise that resolves afer removing the value associated
// with the given key from Redis, failure rejects the promise
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
//instance of redisClient class is created and exported as 'redisClient'
const redisClient = new RedisClient();
module.exports = redisClient;