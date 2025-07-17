import { NextResponse } from 'next/server';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI || '';

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'profileImages' // A new bucket for profile images
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }

    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'profileImages' });

    const uploadStream = gfs.openUploadStream(file.name, {
      metadata: { userId: userId, contentType: file.type },
    });

    uploadStream.end(buffer);

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve(NextResponse.json({ message: 'File uploaded successfully.', fileId: uploadStream.id }, { status: 200 }));
      });

      uploadStream.on('error', (error) => {
        reject(NextResponse.json({ message: 'File upload failed.', error: error.message }, { status: 500 }));
      });
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
