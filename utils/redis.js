import redis from 'redis';

const client = redis.createClient({
    host: '127.0.0.1', // Redis server host (default: localhost)
    port: 6379,        // Redis server port (default: 6379)
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

export default client;
