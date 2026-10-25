import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyToken, 
  verifyRefreshToken, 
  generateAccessToken, 
  getUserById 
} from '@/lib/auth';

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

    // Verify refresh token
    let payload;
    try {
      payload = await verifyToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        },
        { status: 401 }
      );
    }

    // Check if refresh token exists in database
    const isValidRefreshToken = await verifyRefreshToken(refreshToken, payload.userId);

    if (!isValidRefreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Refresh token not found or expired',
          },
        },
        { status: 401 }
      );
    }

    // Get fresh user data (permissions might have changed)
    const user = await getUserById(payload.userId);

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'User account is inactive',
          },
        },
        { status: 403 }
      );
    }

    // Generate new access token with fresh data
    const newPayload = {
      userId: user.id,
      employeeId: user.employee_id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      departmentId: user.department_id,
      departmentName: user.department_name,
      permissions: user.permissions || [],
    };

    const accessToken = await generateAccessToken(newPayload);

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
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
