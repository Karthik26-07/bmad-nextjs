import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { to, subject, body } = await request.json();

  // In a real application, you would integrate with an email service here
  // For example, using Nodemailer, SendGrid, Mailgun, etc.
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);

  // Simulate email sending success
  return NextResponse.json({ message: 'Email sent successfully (simulated)' });
}
