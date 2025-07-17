import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, role, barCouncilId } = await request.json();

    const client = await clientPromise;
    const db = client.db('legalconnect'); // Replace with your database name

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      fullName,
      phone,
      role,
      barCouncilId: role === 'lawyer' ? barCouncilId : undefined,
      emailVerified: false,
      suspended: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json({ message: 'User registered successfully.', userId: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
