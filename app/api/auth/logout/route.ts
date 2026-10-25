import { NextRequest, NextResponse } from 'next/server';
import { deleteRefreshToken, verifyToken, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Refresh token is required',
          },
        },
        { status: 400 }
      );
    }

    // Verify token to get user info for audit log
    try {
      const payload = await verifyToken(refreshToken);
      
      // Delete refresh token
      await deleteRefreshToken(refreshToken);

      // Create audit log
      await createAuditLog(
        payload.userId,
        `${payload.email}`,
        'User logged out',
        'user',
        payload.userId,
        payload.email,
        req.headers.get('x-forwarded-for'),
        req.headers.get('user-agent'),
        'info'
      );
    } catch {
      // Token might be expired, but still try to delete it
      await deleteRefreshToken(refreshToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
