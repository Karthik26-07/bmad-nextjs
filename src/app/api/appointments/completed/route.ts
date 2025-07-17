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

    const appointments = await db.collection('appointments').find({
      citizenId: new ObjectId(userId),
      status: 'completed',
    }).toArray();

    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
