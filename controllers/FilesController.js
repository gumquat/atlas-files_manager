const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const mongoUtil = require('../utils/db');
const redisUtil = require('../utils/redisUtil');

require('dotenv').config();

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

// Ensure the storage directory exists
if (!fs.existsSync(FOLDER_PATH)) {
  fs.mkdirSync(FOLDER_PATH, { recursive: true });
}

const postFile = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisUtil.redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, type, parentId = 0, isPublic = false, data } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }
  if (!type || ![`folder`, `file`, `image`].includes(type)) {
    return res.status(400).json({ error: `Missing of invlid type` });
  }
  if (!data && type !== `folder`) {
    return res.status(400).json({ error: `Missing data` });
  }

  // Validate parentId if provided
  if (parentId !== 0) {
    const parent = await mongoUtil.findFileById(parentId);
    if (!parent) {
      return res.status(400).json({ error: `Parent not found` });
    }
    if (parent.type !== `folder`) {
      return res.status(400).json({ error: `Parent is not a folder` });
    }
  }

  let localPath = null;
  if (type !== `folder`) {
    const filename = uuidv4();
    localPath = path.join(FOLDER_PATH, filename);
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
  }

  const newFile = {
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  };

  const result = await mongoUtil.createFile(newFile);

  res.status(201).json({
    id: result._id,
    name: result.name,
    type: result.type,
    isPublic: result.isPublic,
    parentId: result.parentId,
    localPath: result.localPath,
  });
};

module.exports = {
  postFile,
};