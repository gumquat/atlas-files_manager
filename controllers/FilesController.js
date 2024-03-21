const { v4: uuidv4 } = require('uuid');
import { ObjectId } from 'mongodb';
const fs = require('fs');
const path = require('path');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
import path from 'path';

// // require('dotenv').config();

// const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

// // Ensure the storage directory exists
// if (!fs.existsSync(FOLDER_PATH)) {
//   fs.mkdirSync(FOLDER_PATH, { recursive: true });
// }

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      type,
      parentId = 0,
      isPublic = false,
      data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parent = null;
    // Validate parentId if provided
    if (parentId !== 0) {
      parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      // double check this line
      userId,
      name,
      type,
      isPublic,
      parentId: parentId !== '0' ? new ObjectId(parentId) : 0,
    };

    // ////////////////////////CONSTRUCTION///////////////////////////// //

    //double check this part
    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const fileName = uuidv4();
      const filePath = path.join(folderPath, fileName);

      const fileBuffer = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileBuffer);

      fileData.localPath = filePath;
    }

    const result = await dbClient.db.collection('files').insertOne(fileData);

    if (type === 'image') {
      fileQueue.add({
        userId: userId.toString(),
        fileId: newFile.insertedId.toString(),
      });
    }

    return res.status(201).json({
      id: result.insertedId,
      userId: newFile.userId,
      name: newFile.name,
      type: newFile.type,
      isPublic: newFile.isPublic,
      parentId: newFile.parentId,
      ...(type !== 'folder' && { localPath: newFile.localPath }),
    });
  }}

module.exports = FilesController;
