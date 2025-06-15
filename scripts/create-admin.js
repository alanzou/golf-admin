#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('🔧 Creating Admin User\n');
  
  const name = await question('Enter username: ');
  const password = await question('Enter password: ');
  const email = await question('Enter email (optional): ');
  
  const userData = {
    name,
    password,
    email: email || '',
    role: 'admin'
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('\n✅ Admin user created successfully!');
      console.log(`Username: ${result.user.name}`);
      console.log(`Email: ${result.user.email}`);
      console.log(`Role: ${result.user.role}`);
      console.log('\nYou can now login at: http://localhost:3000/admin/login');
    } else {
      console.log('\n❌ Error creating user:', result.error);
    }
  } catch (error) {
    console.log('\n❌ Network error:', error.message);
    console.log('Make sure your Next.js server is running on http://localhost:3000');
  }

  rl.close();
}

createAdmin(); 