const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

const feedbackSchema = Joi.object({
  eventId: Joi.number().integer().required(),
  label: Joi.string().valid('false_positive', 'false_negative', 'correct').required(),
  notes: Joi.string().optional().allow(''),
});

router.post('/', authMiddleware, validateRequest(feedbackSchema), async (req, res) => {
  try {
    const { eventId, label, notes } = req.body;
    
    // Verify event belongs to user's company
    const eventCheck = await db.query(
      'SELECT id FROM events WHERE id = $1 AND company_id = $2',
      [eventId, req.user.companyId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await db.query(
      'INSERT INTO feedback (event_id, user_id, label, notes) VALUES ($1, $2, $3, $4)',
      [eventId, req.user.userId, label, notes || '']
    );

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.*, e.type, e.verdict 
       FROM feedback f 
       JOIN events e ON f.event_id = e.id 
       WHERE e.company_id = $1 
       ORDER BY f.created_at DESC 
       LIMIT 50`,
      [req.user.companyId]
    );

    res.json({ feedback: result.rows });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;
