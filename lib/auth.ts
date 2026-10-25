import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { db } from './db';

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production-min-32-characters'
);
const JWT_ACCESS_EXPIRY = '15m'; // 15 minutes
const JWT_REFRESH_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  employeeId: string;
  email: string;
  roleId: string;
  roleName: string;
  departmentId: string;
  departmentName: string;
  permissions: string[];
}

export interface UserSession {
  user: {
    id: string;
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    department: string;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_ACCESS_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Generate JWT refresh token
 */
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_REFRESH_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get user with role and permissions from database
 */
export async function getUserByEmail(email: string) {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT 
        u.id, u.employee_id, u.email, u.password_hash,
        u.first_name, u.last_name, u.full_name, u.status, u.phone, u.photo_url,
        u.joining_date, u.employment_type, u.last_login,
        r.id as role_id, r.name as role_name, r.color as role_color,
        d.id as department_id, d.name as department_name, d.code as department_code,
        ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN departments d ON u.department_id = d.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.email = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, r.id, r.name, r.color, d.id, d.name, d.code`,
      [email]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT 
        u.id, u.employee_id, u.email,
        u.first_name, u.last_name, u.full_name, u.status, u.phone, u.photo_url,
        u.joining_date, u.employment_type, u.last_login,
        r.id as role_id, r.name as role_name, r.color as role_color,
        d.id as department_id, d.name as department_name, d.code as department_code,
        ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN departments d ON u.department_id = d.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, r.id, r.name, r.color, d.id, d.name, d.code`,
      [userId]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const client = await db.connect();
  try {
    await client.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  } finally {
    client.release();
  }
}

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(
  userId: string,
  token: string,
  ipAddress: string | null,
  userAgent: string | null
): Promise<void> {
  const client = await db.connect();
  try {
    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await client.query(
      `INSERT INTO user_sessions (user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, token, ipAddress, userAgent, expiresAt]
    );
  } finally {
    client.release();
  }
}

/**
 * Verify refresh token exists and is valid
 */
export async function verifyRefreshToken(token: string, userId: string): Promise<boolean> {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT id FROM user_sessions 
       WHERE refresh_token = $1 AND user_id = $2 AND expires_at > CURRENT_TIMESTAMP`,
      [token, userId]
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

/**
 * Delete refresh token (logout)
 */
export async function deleteRefreshToken(token: string): Promise<void> {
  const client = await db.connect();
  try {
    await client.query('DELETE FROM user_sessions WHERE refresh_token = $1', [token]);
  } finally {
    client.release();
  }
}

/**
 * Delete all user's refresh tokens (logout from all devices)
 */
export async function deleteAllUserTokens(userId: string): Promise<void> {
  const client = await db.connect();
  try {
    await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
  } finally {
    client.release();
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  actorUserId: string | null,
  actorName: string | null,
  action: string,
  targetType: string | null,
  targetId: string | null,
  targetName: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  severity: 'info' | 'warning' | 'critical' = 'info',
  details?: any
): Promise<void> {
  const client = await db.connect();
  try {
    await client.query(
      `INSERT INTO audit_logs 
       (actor_user_id, actor_name, action, target_type, target_id, target_name, 
        ip_address, user_agent, severity, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [actorUserId, actorName, action, targetType, targetId, targetName, 
       ipAddress, userAgent, severity, details ? JSON.stringify(details) : null]
    );
  } finally {
    client.release();
  }
}
