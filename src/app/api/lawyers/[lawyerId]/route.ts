import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { lawyerId: string } }) {
  try {
    const { lawyerId } = params;

    const client = await clientPromise;
    const db = client.db('legalconnect');

    const lawyer = await db.collection('lawyerProfiles').findOne({ _id: new ObjectId(lawyerId) });

    if (!lawyer) {
      return NextResponse.json({ message: 'Lawyer not found.' }, { status: 404 });
    }

    return NextResponse.json(lawyer);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
