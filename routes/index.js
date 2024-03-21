const express = require('express');

const router = express.Router();

// Require controllers
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

// API Endpoints

    // GET routes //
// // checks the status of redis and db
router.get('/status', AppController.getStatus);
// // log number of users and files there are
router.get('/stats', AppController.getStats);
// // sign in and authentication token creation for user
router.get('/connect', AuthController.getConnect);
// // sign the user off
router.get('/disconnect', AuthController.getDisconnect);
// // retrieve identified user by token
router.get('/users/me', UsersController.getMe);
// // retrieve file by ID
router.get('/files/:id', FilesController.getShow);
// // retrieve all files
router.get('/files', FilesController.getIndex);
// // returns the content of a file by id
router.get('/files/:id/data', FilesController.getFile);


    // POST routes
// // create new user
router.post('/users', UsersController.postNew);
// // retrieve file by body data
router.post('/files', FilesController.postUpload);
// // retrieves file based on its body content
router.post('/files', FilesController.postUpload);


    // PUT routes
// // put a file
router.put('/files/:id/publish', FilesController.putPublish);
// // remove a file
router.put('/files/:id/unpublish', FilesController.putUnpublish);


module.exports = router;
