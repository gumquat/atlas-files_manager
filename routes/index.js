// Import 'express' module to create router instance
const express = require('express');
// Create new instance of 'Express' router, assign it to 'router' variable
const router = express.Router();

// Import 'AppController'
const AppController = require('../controllers/appController');
// Import 'UsersController'
const UsersController = require('../controllers/UsersController');
// Import 'AuthController'
const AuthController = require('../controllers/AuthController');
// Import 'FilesController'
const FilesController = require('../controllers/FilesController');

// GET /status
// When a 'get' request is made to the '/status' route
// the 'Appcontroller.getStatus' func will run to handle the request
router.get('/status', AppController.getStatus);

// GET /stats
// When a 'get' request is made to the '/stats' route
// the 'Appcontroller.getStats' func will run to handle the request
router.get('/stats', AppController.getStats);

// POST /users
// When a 'post' request is made to the '/users' route
// the 'UsersController.postNew' func will run to handle the request
router.post('/users', UsersController.postNew);

// GET /connect
// When a 'get' request is made to the '/connect' route
// the 'AuthController.getConnect' func will run to handle the request
router.get('/connect', AuthController.getConnect);

// GET /disconnect
// When a 'get' request is made to the '/disconnect' route
// the 'AuthController.getDisconnect' func will run to handle the request
router.get('/disconnect', AuthController.getDisconnect);

// GET /users/me
// When a 'get' request is made to the '/users/me' route
// the 'UserController.getMe' func will run to handle the request
router.get('/users/me', UsersController.getMe);

// Post /files
// When a 'post' request is made to the '/files' route
// the 'FilesController.postUpload' func will run to handle the request
router.post('/files', FilesController.postUpload);

// Export the router instance so it can be used elsewhere
module.exports = router;
