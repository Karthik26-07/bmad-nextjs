import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const mongoURI = process.env.MONGODB_URI || '';

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'documents' // A new bucket for case documents
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
    const description = formData.get('description') as string;

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

    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'documents' });

    const uploadStream = gfs.openUploadStream(file.name, {
      metadata: { userId: userId, description: description, contentType: file.type },
    });

    uploadStream.end(buffer);

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', async () => {
        const client = await clientPromise;
        const db = client.db('legalconnect');

        await db.collection('caseDocuments').insertOne({
          ownerId: new ObjectId(userId),
          fileId: uploadStream.id, // Store the GridFS file ID
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          description: description,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

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
