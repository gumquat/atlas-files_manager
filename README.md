# atlas-files_manager
This project is a summary of this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

The objective is to build a simple platform to upload and view files:

- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

# Creating an API with Express

Express is a popular Node.js web application framework that provides a set of features for building web applications and APIs. In this document, we'll cover how to create an API with Express, authenticate users, store data in MongoDB and Redis, and set up a background worker.

## Setting up Express

First, we need to create a new Node.js project and install Express:

```bash
mkdir my-api
cd my-api
npm init -y
npm install express
```

Next, create an `index.js` file and add the following code to set up a basic Express server:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

## User Authentication

Express does not provide built-in user authentication functionality, but we can use middleware like [Passport.js](http://www.passportjs.org/) to handle authentication. Passport supports various authentication strategies, including local (username/password), OAuth, and more.

1. Install Passport and the required strategy (e.g., `passport-local` for local authentication):

   ```bash
   npm install passport passport-local
   ```

2. Set up Passport in your application by creating a `config/passport.js` file and configuring the appropriate strategy.

3. Create routes for authentication (e.g., `/login`, `/signup`) and use Passport middleware to authenticate users.

4. Upon successful authentication, store the user information in the session or generate a JSON Web Token (JWT) for stateless authentication.

## Storing Data in MongoDB

MongoDB is a popular NoSQL database that stores data in flexible, JSON-like documents. We can use the official MongoDB Node.js driver to interact with MongoDB from our Express application.

1. Install the MongoDB driver:

   ```bash
   npm install mongodb
   ```

2. Connect to the MongoDB database and create a client instance:

   ```javascript
   const { MongoClient } = require('mongodb');

   const uri = 'mongodb://localhost:27017';
   const client = new MongoClient(uri);

   async function connectToMongo() {
     try {
       await client.connect();
       console.log('Connected to MongoDB');
     } catch (err) {
       console.error('Error connecting to MongoDB', err);
     }
   }

   connectToMongo();
   ```

3. Define your data models (collections) and create CRUD (Create, Read, Update, Delete) operations using the MongoDB client.

## Storing Temporary Data in Redis

Redis is an open-source, in-memory data structure store that can be used as a database, cache, and message broker. It's often used to store temporary data or as a caching layer for applications.

1. Install the Redis client for Node.js:

   ```bash
   npm install redis
   ```

2. Create a Redis client instance and connect to the Redis server:

   ```javascript
   const redis = require('redis');
   const client = redis.createClient();

   client.on('error', (err) => console.log('Redis Client Error', err));

   client.connect();
   ```

3. Use the Redis client to store and retrieve data. Redis supports various data structures like strings, hashes, lists, sets, and more.

## Setting up a Background Worker

Background workers are useful for offloading time-consuming or asynchronous tasks from the main application thread, such as sending emails, processing uploads, or performing data transformations.

One popular background worker solution for Node.js is [Bull](https://github.com/OptimalBits/bull), a Redis-based queue manager.

1. Install Bull and Redis:

   ```bash
   npm install bull redis
   ```

2. Create a queue instance and define the job processing function:

   ```javascript
   const Queue = require('bull');

   const myQueue = new Queue('my-queue');

   myQueue.process(async (job) => {
     // Job processing logic
     console.log(`Processing job ${job.id}`);
     // ... perform some task
     return { success: true };
   });
   ```

3. Add jobs to the queue from your Express routes or other parts of the application:

   ```javascript
   myQueue.add({ data: 'some data' });
   ```

This is a basic overview of how to create an API with Express, authenticate users, store data in MongoDB and Redis, and set up a background worker. Each of these topics can be explored in greater depth, and you may need to adjust the code examples to fit your specific requirements.
