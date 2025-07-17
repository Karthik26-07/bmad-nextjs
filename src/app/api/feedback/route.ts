import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { lawyerId, citizenId, appointmentId, rating, reviewText } = await request.json();

    const client = await clientPromise;
    const db = client.db('legalconnect');

    const newFeedback = {
      lawyerId: new ObjectId(lawyerId),
      citizenId: new ObjectId(citizenId),
      appointmentId: new ObjectId(appointmentId),
      rating,
      reviewText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('feedback').insertOne(newFeedback);

    return NextResponse.json({ message: 'Feedback submitted successfully.', feedbackId: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
