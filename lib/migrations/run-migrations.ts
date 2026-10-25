import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Use direct connection for migrations (not pooled)
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: true,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migrations...\n');
    
    const migrationsDir = path.join(process.cwd(), 'lib', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      console.log(`📄 Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }
    
    console.log('🎉 All migrations completed successfully!\n');
    
    // Verify setup
    const result = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM roles) as roles_count,
        (SELECT COUNT(*) FROM departments) as departments_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM permissions) as permissions_count
    `);
    
    console.log('📊 Database Summary:');
    console.log(`   Roles: ${result.rows[0].roles_count}`);
    console.log(`   Departments: ${result.rows[0].departments_count}`);
    console.log(`   Users: ${result.rows[0].users_count}`);
    console.log(`   Permissions: ${result.rows[0].permissions_count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations()
  .then(() => {
    console.log('\n✨ Database is ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
