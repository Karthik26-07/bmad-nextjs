import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('legalconnect');

    const feedback = await db.collection('feedback').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'citizenId',
          foreignField: '_id',
          as: 'citizen'
        }
      },
      {
        $unwind: { path: '$citizen', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'lawyerProfiles',
          localField: 'lawyerId',
          foreignField: '_id',
          as: 'lawyerProfile'
        }
      },
      {
        $unwind: { path: '$lawyerProfile', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lawyerProfile.userId',
          foreignField: '_id',
          as: 'lawyerUser'
        }
      },
      {
        $unwind: { path: '$lawyerUser', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          rating: 1,
          reviewText: 1,
          createdAt: 1,
          'citizen.fullName': '$citizen.fullName',
          'lawyer.fullName': '$lawyerUser.fullName',
        }
      }
    ]).toArray();

    return NextResponse.json(feedback);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
