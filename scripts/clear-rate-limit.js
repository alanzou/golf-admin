#!/usr/bin/env node

const { Redis } = require('@upstash/redis');

async function clearRateLimit() {
  try {
    console.log('🧹 Clearing rate limit data from Redis...');
    
    // Create Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
    
    // Clear all keys (flushall) or just rate limit keys
    await redis.flushall();
    
    console.log('✅ Rate limit cleared successfully!');
    console.log('You can now try logging in again.');
    
  } catch (error) {
    console.error('❌ Error clearing rate limit:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connection refused')) {
      console.log('💡 Make sure Redis is running. You might need to start Redis first.');
    } else if (error.message.includes('KV_REST_API_URL')) {
      console.log('💡 Make sure your Redis environment variables are set.');
    }
  } finally {
    process.exit(0);
  }
}

clearRateLimit(); 