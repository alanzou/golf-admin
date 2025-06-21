#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function resetPasswordCLI() {
  const args = process.argv.slice(2);
  
  // Show help if no arguments or help flag
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('🔧 Reset System User Password (CLI)\n');
    console.log('Usage:');
    console.log('  node reset-system-user-password-cli.js <username> <new-password>');
    console.log('  node reset-system-user-password-cli.js --list');
    console.log('');
    console.log('Options:');
    console.log('  --list, -l     List all system users');
    console.log('  --help, -h     Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node reset-system-user-password-cli.js admin newpassword123');
    console.log('  node reset-system-user-password-cli.js --list');
    process.exit(0);
  }

  try {
    // List users option
    if (args.includes('--list') || args.includes('-l')) {
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
        return;
      }

      console.log('📋 System Users:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      users.forEach((user) => {
        const status = user.isActive ? '✅ Active' : '❌ Inactive';
        console.log(`• ${user.name} (${user.role}) - ${status}`);
        if (user.email) {
          console.log(`  Email: ${user.email}`);
        }
        console.log(`  Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
      return;
    }

    // Reset password
    if (args.length < 2) {
      console.log('❌ Error: Both username and new password are required.');
      console.log('Usage: node reset-system-user-password-cli.js <username> <new-password>');
      console.log('Use --help for more information.');
      process.exit(1);
    }

    const [username, newPassword] = args;

    if (!username || !newPassword) {
      console.log('❌ Error: Username and password cannot be empty.');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log('❌ Error: Password must be at least 6 characters long.');
      process.exit(1);
    }

    console.log(`🔧 Resetting password for user: ${username}`);

    // Find the user
    const user = await prisma.systemUser.findUnique({
      where: { name: username },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      console.log(`❌ Error: User '${username}' not found.`);
      console.log('Use --list to see available users.');
      process.exit(1);
    }

    if (!user.isActive) {
      console.log(`⚠️  Warning: User '${username}' is currently inactive.`);
    }

    // Hash the new password
    console.log('🔒 Hashing password...');
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password
    console.log('💾 Updating password in database...');
    await prisma.systemUser.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    console.log('\n✅ Password reset successfully!');
    console.log(`User: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    if (user.email) {
      console.log(`Email: ${user.email}`);
    }
    console.log('\nThe user can now login with the new password.');

  } catch (error) {
    console.log('\n❌ Error resetting password:', error.message);
    
    if (error.code === 'P1001') {
      console.log('💡 Make sure your database is running and accessible.');
    } else if (error.code === 'P2002') {
      console.log('💡 This might be a constraint violation. Check your database.');
    } else if (error.code === 'P2025') {
      console.log('💡 The user record was not found or has been deleted.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n\n👋 Goodbye!');
  await prisma.$disconnect();
  process.exit(0);
});

resetPasswordCLI(); 