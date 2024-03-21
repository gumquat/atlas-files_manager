// Task 1 - MongoDB Utils

const { MongoClient, ObjectId } = require('mongodb');

class DBClient {
  constructor() {
    // Retrieves MongoDB connection using the variables
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    // initializes MongoClient with Url
    this.client = new MongoClient(`mongodb://${host}:${port}`, { useNewUrlParser: true, useUnifiedTopology: true });
    // set inital connection to null, changes if succsessful
    this.db = null;

    // connects to MongoDB
    this.client.connect()
      .then(() => {
        // when connected sets this.db
        this.db = this.client.db(database);
      })
      // logs errors
      .catch((err) => console.error('DB connection err', err));
  }

  // checks if connected
  isAlive() {
    // returns true if this.db is not null
    return !!this.db;
  }

  // counts and returns number of user documents
  async nbUsers() {
    // if not connected, return 0
    if (!this.isAlive()) return 0;
    // if connected, return count of user documents
    return this.db.collection('users').countDocuments();
  }

  // count and return number of file documents
  async nbFiles() {
    // if not connected, return 0
    if (!this.isAlive()) return 0;
    // if connected return count of file documents
    return this.db.collection('files').countDocuments();
  }

  // Retrieve a user by email
  async getUserByEmail(email) {
    if (!this.isAlive()) return null;
    return this.db.collection('users').findOne({ email });
  }

  // Retrieve a user by _id
  async getUserById(userId) {
    if (!this.db) {
      return null;
    }
    // Convert the userId string to an ObjectId for MongoDB
    const objectId = new ObjectId(userId);
    return this.db.collection('users').findOne({ _id: objectId });
  }

  // Create a new user
  async createUser(user) {
    if (!this.isAlive()) return null;
    const result = await this.db.collection('users').insertOne(user);
    return result.ops[0]; // Return the created user document
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
