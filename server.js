//import express and create an instance of the express application
const express = require('express');
const app = express();
//Define a 'Port' variable, defaults to 5000
const PORT = process.env.PORT || 5000;
//import routes module from index file
//const routes = require('./routes/index');


// Load all routes
app.use('/', routes);
// Start the server by listening to the port
app.listen(PORT, () => {
  // Callback func that logs a message when server is running
  console.log(`Server is running on port ${PORT}`);
});