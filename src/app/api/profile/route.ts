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

    const profile = await db.collection('lawyerProfiles').findOne({ userId: new ObjectId(userId) });

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found.' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, ...values } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('legalconnect');

    const result = await db.collection('lawyerProfiles').updateOne(
      { userId: new ObjectId(userId) },
      { $set: { ...values, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Profile updated successfully.', result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
