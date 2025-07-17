import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const specialization = searchParams.get('specialization');

    const client = await clientPromise;
    const db = client.db('legalconnect');

    let query: any = {};

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (specialization) {
      query.specialties = { $regex: specialization, $options: 'i' };
    }

    const lawyers = await db.collection('lawyerProfiles').find(query).toArray();

    // For now, we're just returning the lawyer profile data.
    // In a real app, you'd likely want to join with the users collection
    // to get full_name and email.
    return NextResponse.json(lawyers);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
