const { MongoClient, ObjectId } = require('mongodb');

class DBClient {
  constructor() {
    // host, port, and database
    // const DB_HOST = process.env.DB_HOST || 'localhost';
    // const DB_PORT = process.env.DB_PORT || 27017;
    // const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

    // Connection URL
    // DO NOT USE THIS PART (unless working locally)
    // const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

    const uri = 'mongodb+srv://evannewman:<!!!!!!!!!PASSWORDHERE!!!!!!!>@evannewmanchock-cluster.j599tmt.mongodb.net/?retryWrites=true&w=majority&appName=EvanNewmanChock-CLUSTER';
    // Create a new MongoClient
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;

    // Connect to the MongoDB server
    // this.client.connect((err) => {
    //   if (err) {
    //     console.error('Error connecting to MongoDB:', err);
    //   } else {
    //     console.log('Connected to MongoDB');
    //   }
    // });
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');
      this.db = this.client.db();
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
    }
  }

  isAlive() {
    // Check if the client is connected to MongoDB
    return this.client.isConnected();
  }

  async nbUsers() {
    // Get the 'users' collection
    // const usersCollection = this.client.db().collection('users');

    // Count the number of documents in the collection
    // const usersCount = await usersCollection.countDocuments();

    // return usersCount;
    if (!this.db) {
      console.error('Database connection not established');
      return 0;
    }
    const usersCount = await this.db.collection('users').countDocuments();
    return usersCount;
  }

  async nbFiles() {
    // Get the 'files' collection
    // const filesCollection = this.client.db().collection('files');

    // Count the number of documents in the collection
    // const filesCount = await filesCollection.countDocuments();

    // return filesCount;
    if (!this.db) {
      console.error('Database connection not established');
      return 0;
    }
    const filesCount = await this.db.collection('files').countDocuments();
    return filesCount;
  }

  // MISC BELOW

  // get user by email
  async getUserByEmail(email) {
    if (!this.isAlive()) return null;
    return this.db.collection('users').findOne({ email });
  }

  // get user by id
  async getUserById(userId) {
    if (!this.isAlive()) return null;
    // Convert the userId string to an ObjectId for MongoDB
    const objectId = new ObjectId(userId);
    return this.db.collection('users').findOne({ _id: objectId });
  }

  // crete new user
  async createUser(user) {
    if (!this.isAlive()) return null;
    const result = await this.db.collection('users').insertOne(user);
    return result.ops[0]; // Return the created user document
  }
}

// Create an instance of DBClient and export it
const dbClient = new DBClient();
module.exports = dbClient;
