-- Update all user accounts to use @chinar.tv domain and new password hash
-- Password: ChinarCEO@2026
-- Hash: $2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy

UPDATE users SET 
  email = 'ceo@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'ceo@demo.chinar.tv';

UPDATE users SET 
  email = 'hoo@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'hoo@demo.chinar.tv';

UPDATE users SET 
  email = 'admin@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'admin@demo.chinar.tv';

UPDATE users SET 
  email = 'finance@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'finance@demo.chinar.tv';

UPDATE users SET 
  email = 'operations@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'operations@demo.chinar.tv';

UPDATE users SET 
  email = 'technical@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'technical@demo.chinar.tv';

UPDATE users SET 
  email = 'production@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'production@demo.chinar.tv';

UPDATE users SET 
  email = 'employee@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'employee@demo.chinar.tv';

UPDATE users SET 
  email = 'viewer@chinar.tv',
  password_hash = '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy',
  updated_at = NOW()
WHERE email = 'viewer@demo.chinar.tv';
