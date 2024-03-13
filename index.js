// Import 'express' module to create router instance
const express = require('express');
// Create new instance of 'Express' router, assign it to 'router' variable
const router = express.Router();
// Import 'AppController'
const AppController = require('../controllers/AppController');

// GET /status
// When a 'get' request is made to the '/status' route
// the 'Appcontroller.getStatus' func will run to handle the request
router.get('/status', AppController.getStatus);

// GET /stats
// When a 'get' request is made to the '/stats' route
// the 'Appcontroller.getStats' func will run to handle the request
router.get('/stats', AppController.getStats);

// Export the router instance so it can be used elsewhere
module.exports = router;