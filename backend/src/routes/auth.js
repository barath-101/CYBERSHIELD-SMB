const express = require('express');
const Joi = require('joi');
const authService = require('../services/authService');
const { validateRequest } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  companyId: Joi.number().integer().required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, companyId, role } = req.body;
    const user = await authService.register(email, password, companyId, role);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', authLimiter, validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh', validateRequest(refreshSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
