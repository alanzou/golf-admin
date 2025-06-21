#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function resetPassword() {
  console.log('🔧 Reset System User Password\n');
  
  try {
    // First, show available users
    const users = await prisma.systemUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No system users found in the database.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    console.log('📋 Available system users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach((user, index) => {
      const status = user.isActive ? '✅ Active' : '❌ Inactive';
      console.log(`${index + 1}. ${user.name} (${user.role}) - ${status}`);
      if (user.email) {
        console.log(`   Email: ${user.email}`);
      }
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get user selection
    const userChoice = await question('Enter the number of the user to reset password for: ');
    const userIndex = parseInt(userChoice) - 1;

    if (isNaN(userIndex) || userIndex < 0 || userIndex >= users.length) {
      console.log('❌ Invalid selection. Please run the script again.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    const selectedUser = users[userIndex];
    console.log(`\n🎯 Selected user: ${selectedUser.name} (${selectedUser.role})`);

    // Confirm selection
    const confirm = await question('Are you sure you want to reset this user\'s password? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Password reset cancelled.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Get new password
    const newPassword = await question('\nEnter new password: ');
    
    if (!newPassword || newPassword.trim().length < 6) {
      console.log('❌ Password must be at least 6 characters long.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    const confirmPassword = await question('Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Hash the new password
    console.log('\n🔒 Hashing password...');
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    console.log('💾 Updating password in database...');
    await prisma.systemUser.update({
      where: { id: selectedUser.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    console.log('\n✅ Password reset successfully!');
    console.log(`User: ${selectedUser.name}`);
    console.log(`Role: ${selectedUser.role}`);
    console.log('The user can now login with the new password.');

  } catch (error) {
    console.log('\n❌ Error resetting password:', error.message);
    
    if (error.code === 'P1001') {
      console.log('💡 Make sure your database is running and accessible.');
    } else if (error.code === 'P2002') {
      console.log('💡 This might be a constraint violation. Check your database.');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  await prisma.$disconnect();
  process.exit(0);
});

resetPassword(); 