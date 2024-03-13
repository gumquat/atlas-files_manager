const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    // host, port, and database
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

    // Connection URL
    const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

    // Create a new MongoClient
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Connect to the MongoDB server
    this.client.connect((err) => {
      if (err) {
        console.error('Error connecting to MongoDB:', err);
      } else {
        console.log('Connected to MongoDB');
      }
    });
  }

  isAlive() {
    // Check if the client is connected to MongoDB
    return this.client.isConnected();
  }

  async nbUsers() {
    // Get the 'users' collection
    const usersCollection = this.client.db().collection('users');

    // Count the number of documents in the collection
    const usersCount = await usersCollection.countDocuments();

    return usersCount;
  }

  async nbFiles() {
    // Get the 'files' collection
    const filesCollection = this.client.db().collection('files');

    // Count the number of documents in the collection
    const filesCount = await filesCollection.countDocuments();

    return filesCount;
  }
}

// Create an instance of DBClient and export it
const dbClient = new DBClient();
module.exports = dbClient;