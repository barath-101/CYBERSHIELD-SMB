const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const config = require('../config');

class AuthService {
  async register(email, password, companyId, role = 'user') {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      'INSERT INTO users (email, password_hash, company_id, role) VALUES ($1, $2, $3, $4) RETURNING id, email, company_id, role',
      [email, passwordHash, companyId, role]
    );

    return result.rows[0];
  }

  async login(email, password) {
    const result = await db.query(
      'SELECT id, email, password_hash, company_id, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, companyId: user.company_id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        companyId: user.company_id,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      
      const result = await db.query(
        'SELECT id, email, company_id, role FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, companyId: user.company_id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

module.exports = new AuthService();
