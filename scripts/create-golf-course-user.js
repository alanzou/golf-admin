#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createGolfCourseUser() {
  console.log('🏌️ Creating Golf Course User\n');
  
  const golfCourseId = await question('Enter golf course ID: ');
  const username = await question('Enter username: ');
  const password = await question('Enter password: ');
  const email = await question('Enter email (optional): ');
  const firstName = await question('Enter first name (optional): ');
  const lastName = await question('Enter last name (optional): ');
  const role = await question('Enter role (STAFF/MANAGER/OWNER) [STAFF]: ') || 'STAFF';
  
  const userData = {
    username,
    password,
    email: email || '',
    firstName: firstName || '',
    lastName: lastName || '',
    role
  };

  try {
    // First, get a system admin token
    console.log('\n🔐 Please provide system admin credentials to create the user:');
    const adminUsername = await question('System admin username: ');
    const adminPassword = await question('System admin password: ');

    // Login as system admin
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: adminUsername,
        password: adminPassword
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      console.log('\n❌ System admin login failed:', loginData.error);
      rl.close();
      return;
    }

    // Create golf course user
    const response = await fetch(`http://localhost:3000/api/golf-course/${golfCourseId}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('\n✅ Golf course user created successfully!');
      console.log(`Username: ${result.user.username}`);
      console.log(`Email: ${result.user.email}`);
      console.log(`Role: ${result.user.role}`);
      console.log(`Golf Course: ${result.user.GolfCourse.name}`);
      console.log('\nYou can now login at the subdomain login page');
    } else {
      console.log('\n❌ Error creating user:', result.error);
    }
  } catch (error) {
    console.log('\n❌ Network error:', error.message);
    console.log('Make sure your Next.js server is running on http://localhost:3000');
  }

  rl.close();
}

createGolfCourseUser(); 