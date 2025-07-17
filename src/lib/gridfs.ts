import { GridFsStorage } from 'multer-gridfs-storage';
import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI || '';

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});

export default storage;
