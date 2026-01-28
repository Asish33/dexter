import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,  // This will use the updated URL from .env
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect().then(() => {
  console.log('Connected to Redis');
}).catch(err => {
  console.error('Failed to connect to Redis', err);
});

export default redisClient;