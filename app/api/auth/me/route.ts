import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authorization token is required',
          },
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
        },
        { status: 401 }
      );
    }

    // Get user data
    const user = await getUserById(payload.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    if (user.status !== 'active') {
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

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          employeeId: user.employee_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          name: user.full_name,
          role: user.role_name,
          department: user.department_name,
          status: user.status,
          phone: user.phone,
          photoUrl: user.photo_url,
          permissions: user.permissions || [],
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
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
