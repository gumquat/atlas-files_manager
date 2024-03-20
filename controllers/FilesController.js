const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const fileQueue = require('../worker');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const ALLOWED_TYPES = ['folder', 'file', 'image'];
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  // GET USER by their id
  static async getUserId(token) {
    return redisClient.get(`auth_${token}`);
  }

  static async getFileById(id, userId) {
    return dbClient.db.collection('files').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
  }

  static isValidType(type) {
    return ALLOWED_TYPES.includes(type);
  }

  static async createFolder(fileData) {
    return dbClient.db.collection('files').insertOne(fileData);
  }

  static async createFile(fileData, fileBuffer) {
    const folderPath = FOLDER_PATH;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const fileName = uuidv4();
    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, fileBuffer);
    fileData.localPath = filePath;

    return dbClient.db.collection('files').insertOne(fileData);
  }

  static async addToQueue(userId, fileId) {
    fileQueue.add({
      userId: userId.toString(),
      fileId: fileId.toString(),
    });
  }

  // POST/UPLOAD///files
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await this.getUserId(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!this.isValidType(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parentFile = null;
    if (parentId !== '0') {
      parentFile = await this.getFileById(parentId, userId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId !== '0' ? new ObjectId(parentId) : 0,
    };

    let newFile;
    if (type === 'folder') {
      newFile = await this.createFolder(fileData);
    } else {
      const fileBuffer = Buffer.from(data, 'base64');
      newFile = await this.createFile(fileData, fileBuffer);
      if (type === 'image') {
        this.addToQueue(userId, newFile.insertedId);
      }
    }

    return res.status(201).json({
      id: newFile.insertedId,
      userId: fileData.userId,
      name: fileData.name,
      type: fileData.type,
      isPublic: fileData.isPublic,
      parentId: fileData.parentId,
      ...(type !== 'folder' && { localPath: fileData.localPath }),
    });
  }

  // RETRIEVES USER IDS from redis using a token
  // GET /files/:id
  static async getShow(req, res) {
    try {
      const token = req.headers['x-token'];
      const userId = await this.getUserId(token);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const fileId = req.params.id;
      const file = await this.getFileById(fileId, userId);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
  
      return res.json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        ...(file.type !== 'folder' && { localPath: file.localPath }),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // RETREIVES USERS ID from redis using a token
  // GET /files
  static async getIndex(req, res) {
    try {
      const token = req.headers['x-token'];
      const userId = await this.getUserId(token);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const parentId = req.query.parentId || '0';
      const page = parseInt(req.query.page, 10) || 0;
      const limit = 20;
      const skip = page * limit;

      const query = {
        userId: new ObjectId(userId),
        parentId: parentId === '0' ? parentId : new ObjectId(parentId),
      };

      const files = await dbClient.db
        .collection('files')
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      const result = files.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // RETRIEVES USER ID from redis using a token
  // PUT /files/:id/publish
  static async putPublish(req, res) {
    try {
      const token = req.headers['x-token'];
      const userId = await this.getUserId(token);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fileId = req.params.id;
      const file = await this.getFileById(fileId, userId);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      const updatedFile = await dbClient.db
        .collection('files')
        .findOneAndUpdate(
          { _id: new ObjectId(fileId) },
          { $set: { isPublic: true } },
          { returnDocument: 'after' }
        );

      return res.status(200).json({
        id: updatedFile.value._id,
        userId: updatedFile.value.userId,
        name: updatedFile.value.name,
        type: updatedFile.value.type,
        isPublic: updatedFile.value.isPublic,
        parentId: updatedFile.value.parentId,
        ...(updatedFile.value.type !== 'folder' && { localPath: updatedFile.value.localPath }),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // same as putPublish but sets the isPublic property to false instead
  // PUT /files/:id/unpublish
  static async putUnpublish(req, res) {
    try {
      const token = req.headers['x-token'];
      const userId = await this.getUserId(token);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fileId = req.params.id;
      const file = await this.getFileById(fileId, userId);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      const updatedFile = await dbClient.db
        .collection('files')
        .findOneAndUpdate(
          { _id: new ObjectId(fileId) },
          { $set: { isPublic: false } },
          { returnDocument: 'after' }
        );

      return res.status(200).json({
        id: updatedFile.value._id,
        userId: updatedFile.value.userId,
        name: updatedFile.value.name,
        type: updatedFile.value.type,
        isPublic: updatedFile.value.isPublic,
        parentId: updatedFile.value.parentId,
        ...(updatedFile.value.type !== 'folder' && { localPath: updatedFile.value.localPath }),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // RETRIEVES the file ID from the request params and a token
  // GET /files/:id/data
  static async getFile(req, res) {
    const fileId = req.params.id;
    const token = req.headers['x-token'];
    const { size } = req.query;

    try {
      const userId = await this.getUserId(token);
      const file = await this.getFileById(fileId, userId);

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is not public and (no user authenticated or not the owner)
      if (!file.isPublic && (!userId || file.userId.toString() !== userId)) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // Check if the file exists locally
      const localPath = size && ['500', '250', '100'].includes(size)
        ? `${file.localPath}_${size}`
        : file.localPath;

      if (!fs.existsSync(localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Determine the MIME type of the file
      const mimeType = mime.lookup(file.name) || 'application/octet-stream';

      // Serve the file
      res.type(mimeType);
      fs.createReadStream(localPath).pipe(res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

}

module.exports = FilesController;