const express = require('express');
const scanService = require('../services/scanService');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { companyId, limit = 10, offset = 0 } = req.query;
    
    // Use user's companyId if not admin
    const targetCompanyId = req.user.role === 'admin' && companyId 
      ? companyId 
      : req.user.companyId;

    const events = await scanService.getRecentEvents(
      targetCompanyId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT e.*, b.tx_hash, b.chain 
       FROM events e 
       LEFT JOIN blockchain_events b ON e.id = b.event_id 
       WHERE e.id = $1 AND e.company_id = $2`,
      [id, req.user.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.patch('/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query(
      'UPDATE events SET status = $1 WHERE id = $2 AND company_id = $3',
      ['acknowledged', id, req.user.companyId]
    );

    res.json({ message: 'Event acknowledged' });
  } catch (error) {
    console.error('Acknowledge event error:', error);
    res.status(500).json({ error: 'Failed to acknowledge event' });
  }
});

module.exports = router;
