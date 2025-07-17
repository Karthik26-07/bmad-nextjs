import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('legalconnect');

    const lawyers = await db.collection('lawyerProfiles').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user_info'
        }
      },
      {
        $unwind: '$user_info'
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          bio: 1,
          specialties: 1,
          experience: 1,
          photoUrl: 1,
          availability: 1,
          fees: 1,
          verified: 1,
          fullName: '$user_info.fullName',
          email: '$user_info.email',
        }
      }
    ]).toArray();

    return NextResponse.json(lawyers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
