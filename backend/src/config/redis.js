const redis = require('redis');
const config = require('../config');

const client = redis.createClient({
  url: config.redis.url,
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Redis connected successfully');
});

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

module.exports = {
  client,
  connectRedis,
  
  get: async (key) => {
    await connectRedis();
    return client.get(key);
  },

  set: async (key, value, expireSeconds = 3600) => {
    await connectRedis();
    return client.setEx(key, expireSeconds, value);
  },

  del: async (key) => {
    await connectRedis();
    return client.del(key);
  },
};
