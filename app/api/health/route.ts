import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateEnv } from '@/lib/validateEnv';

export async function GET() {
  const envResult = validateEnv();

  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    // DB unreachable
  }

  const ok = envResult.valid && dbOk;

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      checks: {
        env: envResult.valid ? 'ok' : 'missing',
        database: dbOk ? 'ok' : 'unreachable',
      },
      ...(envResult.missing.length > 0 && { missingEnvVars: envResult.missing }),
    },
    { status: ok ? 200 : 503 }
  );
}
