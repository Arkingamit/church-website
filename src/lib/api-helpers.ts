import { NextResponse } from 'next/server';

export function apiSuccess(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400, details?: any) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function withErrorHandler(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error: any) {
    console.error('API Error:', error);
    return apiError(
      error.message || 'Internal server error',
      error.status || 500,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    );
  }
}
