import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, name, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword: hashPassword(password),
        role: 'support', // default role — first user will be upgraded manually
      },
    });

    // If this is the first user, make them owner
    const count = await prisma.user.count();
    if (count === 1) {
      await prisma.user.update({ where: { id: user.id }, data: { role: 'owner' } });
    }

    const token = await createSession(user.id);
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    res.headers.set('Set-Cookie', setSessionCookie(token));
    return res;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
