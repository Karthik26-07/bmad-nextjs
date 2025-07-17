import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { lawyerId, citizenId, appointmentDate, appointmentTime, duration, notes } = await request.json();

    const client = await clientPromise;
    const db = client.db('legalconnect');

    const newAppointment = {
      lawyerId: new ObjectId(lawyerId),
      citizenId: new ObjectId(citizenId),
      appointmentDate,
      appointmentTime,
      duration,
      notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('appointments').insertOne(newAppointment);

    return NextResponse.json({ message: 'Appointment booked successfully.', appointmentId: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
