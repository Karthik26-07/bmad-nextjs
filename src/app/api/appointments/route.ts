import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId || !role) {
      return NextResponse.json({ message: 'User ID and role are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('legalconnect');

    let query: any = {};
    if (role === 'lawyer') {
      query.lawyerId = new ObjectId(userId);
    } else {
      query.citizenId = new ObjectId(userId);
    }

    const appointments = await db.collection('appointments').find(query).toArray();

    // For each appointment, fetch lawyer and citizen details
    const populatedAppointments = await Promise.all(appointments.map(async (appointment) => {
      const lawyer = await db.collection('users').findOne({ _id: appointment.lawyerId });
      const citizen = await db.collection('users').findOne({ _id: appointment.citizenId });
      return { ...appointment, lawyer, citizen };
    }));

    return NextResponse.json(populatedAppointments);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
