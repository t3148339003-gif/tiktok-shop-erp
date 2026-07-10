import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, clearSessionCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', clearSessionCookie());
  return res;
}
