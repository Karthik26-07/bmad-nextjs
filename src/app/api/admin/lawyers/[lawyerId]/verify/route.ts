import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { lawyerId: string } }) {
  try {
    const { lawyerId } = params;
    const { verified } = await request.json();

    const client = await clientPromise;
    const db = client.db('legalconnect');

    const result = await db.collection('lawyerProfiles').updateOne(
      { _id: new ObjectId(lawyerId) },
      { $set: { verified: verified, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Lawyer not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lawyer verification status updated successfully.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
