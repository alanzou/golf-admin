import { redis } from './lib/redis';

async function main() {
  try {
    // Quick round-trip check
    const pong = await redis.ping();
    console.log('Ping →', pong); // should print "PONG"

    // Optional read / write test
    await redis.set('healthcheck', 'ok');
    const value = await redis.get<string>('healthcheck');
    console.log('Value →', value); // should print "ok"
  } catch (err) {
    console.error('Redis error:', err);
  } finally {
    process.exit();
  }
}

main();