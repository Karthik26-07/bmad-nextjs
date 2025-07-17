import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const { suspended } = await request.json();

    const client = await clientPromise;
    const db = client.db('legalconnect');

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { suspended: suspended, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User status updated successfully.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
