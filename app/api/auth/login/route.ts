import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmail, 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken,
  updateLastLogin,
  storeRefreshToken,
  createAuditLog
} from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Get user from database
    const user = await getUserByEmail(email);

    if (!user) {
      // Log failed login attempt
      await createAuditLog(
        null,
        'Unknown',
        'Failed login attempt',
        'user',
        email,
        email,
        req.headers.get('x-forwarded-for'),
        req.headers.get('user-agent'),
        'warning'
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.status !== 'active') {
      await createAuditLog(
        user.id,
        user.full_name,
        'Login attempt on inactive account',
        'user',
        user.id,
        user.full_name,
        req.headers.get('x-forwarded-for'),
        req.headers.get('user-agent'),
        'warning'
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Your account is inactive. Please contact administrator.',
          },
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      await createAuditLog(
        user.id,
        user.full_name,
        'Failed login attempt',
        'user',
        user.id,
        user.full_name,
        req.headers.get('x-forwarded-for'),
        req.headers.get('user-agent'),
        'warning'
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    // Create JWT payload
    const jwtPayload = {
      userId: user.id,
      employeeId: user.employee_id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      departmentId: user.department_id,
      departmentName: user.department_name,
      permissions: user.permissions || [],
    };

    // Generate tokens
    const accessToken = await generateAccessToken(jwtPayload);
    const refreshToken = await generateRefreshToken(jwtPayload);

    // Store refresh token
    await storeRefreshToken(
      user.id,
      refreshToken,
      req.headers.get('x-forwarded-for'),
      req.headers.get('user-agent')
    );

    // Update last login
    await updateLastLogin(user.id);

    // Create audit log
    await createAuditLog(
      user.id,
      user.full_name,
      'User logged in',
      'user',
      user.id,
      user.full_name,
      req.headers.get('x-forwarded-for'),
      req.headers.get('user-agent'),
      'info'
    );

    // Return user data and tokens
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
        },
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
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
