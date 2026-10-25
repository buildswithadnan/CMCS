-- Fix refresh_token column length issue
-- JWT tokens can be longer than 500 characters, especially with custom claims
ALTER TABLE user_sessions 
ALTER COLUMN refresh_token TYPE TEXT;
