const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const mongoUtil = require('../utils/db');
const redisUtil = require('../utils/redis');

// require('dotenv').config();

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

// Ensure the storage directory exists
if (!fs.existsSync(FOLDER_PATH)) {
  fs.mkdirSync(FOLDER_PATH, { recursive: true });
}

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisUtil.get(`auth_${token}`);

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
      userId: new ObjectiD(userId),
      name,
      type,
      isPublic,
      parentId: parentId !== '0' ? new ObjectId(parentId) : 0,
    };

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

    // Add job to Bull queue for generating thumbnail
    if (fileData.type === 'image') {
      console.log('Type of file is an image');
      fileQueue.add({
        userId: new ObjectId(userId),
        fileId: new ObjectId(nresult.insertedId),
      });
    }

    // console.log('result is:', result);
    return res.status(201).json({
      id: result.insertedId,
      userId: fileData.userId,
      name: fileData.name,
      type: fileData.type,
      isPublic: fileData.isPublic,
      parentId: fileData.parentId,
      ...(type !== 'folder' && { localPath: fileData.localPath }),
    });
  }};

module.exports = FilesController;
