import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { feedbackId: string } }) {
  try {
    const { feedbackId } = params;
    const { action } = await request.json(); // 'approve' or 'reject'

    const client = await clientPromise;
    const db = client.db('legalconnect');

    // In a real application, you might update a 'status' field in the feedback document
    // For this example, we'll just acknowledge the action.
    const result = await db.collection('feedback').updateOne(
      { _id: new ObjectId(feedbackId) },
      { $set: { moderationStatus: action, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Feedback not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: `Feedback ${feedbackId} ${action}d successfully.` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
