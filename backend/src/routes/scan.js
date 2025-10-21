const express = require('express');
const Joi = require('joi');
const scanService = require('../services/scanService');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');
const { scanLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const scanImageSchema = Joi.object({
  thumbnail_base64: Joi.string().optional(),
  src_url: Joi.string().uri().optional(),
  page_url: Joi.string().uri().required(),
  mime: Joi.string().optional(),
  metadata: Joi.object({
    agentId: Joi.number().integer().optional(),
    width: Joi.number().optional(),
    height: Joi.number().optional(),
    timestamp: Joi.number().optional(),
  }).optional(),
});

const scanPopupSchema = Joi.object({
  page_url: Joi.string().uri().required(),
  raw_text: Joi.string().required(),
  field_labels: Joi.array().items(Joi.string()).default([]),
  agentId: Joi.number().integer().optional(),
});

router.post('/image', authMiddleware, scanLimiter, validateRequest(scanImageSchema), async (req, res) => {
  try {
    const result = await scanService.scanImage(req.body, req.user);
    res.json(result);
  } catch (error) {
    console.error('Scan image route error:', error);
    res.status(500).json({ error: 'Failed to scan image' });
  }
});

router.post('/popup', authMiddleware, scanLimiter, validateRequest(scanPopupSchema), async (req, res) => {
  try {
    const result = await scanService.scanPopup(req.body, req.user);
    res.json(result);
  } catch (error) {
    console.error('Scan popup route error:', error);
    res.status(500).json({ error: 'Failed to scan popup' });
  }
});

module.exports = router;
