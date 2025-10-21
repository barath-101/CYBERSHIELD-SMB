require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cybershield_db',
    user: process.env.DB_USER || 'cybershield',
    password: process.env.DB_PASSWORD || 'cybershield123',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5000',
  },

  blockchain: {
    rpcUrl: process.env.ETH_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    privateKey: process.env.ETH_PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
    chainId: parseInt(process.env.CHAIN_ID || '80001'),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
