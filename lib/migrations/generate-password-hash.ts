import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'ChinarCEO@2026';
  const hash = await bcrypt.hash(password, 10);
  console.log('\nPassword:', password);
  console.log('Hash:', hash);
  console.log('\nUse this hash in 002_seed_data.sql\n');
}

generateHash();
