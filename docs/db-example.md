# Neon Postgres Database Usage Examples

## Basic Query Example

```typescript
import { db, query } from '@/lib/db';

// Simple query with the helper function
const users = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Or use the pool directly
const client = await db.connect();
try {
  const result = await client.query('SELECT * FROM users');
  console.log(result.rows);
} finally {
  client.release();
}
```

## In API Routes

```typescript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const users = await query('SELECT * FROM users LIMIT 10');
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}
```

## In Server Components

```typescript
import { query } from '@/lib/db';

export default async function UsersPage() {
  const users = await query('SELECT * FROM users');
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Connection Strings

- **DATABASE_URL** (pooled): Use for all application queries
  - Includes `-pooler` in hostname
  - Supports up to 10,000 concurrent connections
  - Perfect for serverless/edge environments

- **DATABASE_URL_UNPOOLED** (direct): Use for migrations and admin tasks
  - Direct connection to Postgres
  - Required for schema migrations
  - Use with pg_dump, pg_restore, LISTEN/NOTIFY

## Important Notes

1. Always release clients in a `finally` block
2. Use parameterized queries ($1, $2) to prevent SQL injection
3. The pool is a singleton - don't create multiple pools
4. Connection pooling is automatic with DATABASE_URL
