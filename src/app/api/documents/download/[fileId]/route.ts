import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI || '';

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
  try {
    const { fileId } = params;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }

    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'documents' });

    const files = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (!files || files.length === 0) {
      return new NextResponse('No file exists', { status: 404 });
    }

    const readStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    const headers = new Headers();
    headers.set('Content-Type', files[0].contentType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);

    return new NextResponse(readStream as any, { headers });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
