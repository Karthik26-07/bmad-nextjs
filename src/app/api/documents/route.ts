import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('legalconnect');

    const documents = await db.collection('caseDocuments').find({
      $or: [
        { ownerId: new ObjectId(userId) },
        { sharedWithId: new ObjectId(userId) } // Assuming sharedWithId is the user ID
      ]
    }).toArray();

    return NextResponse.json(documents);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
