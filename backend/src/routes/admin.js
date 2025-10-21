const express = require('express');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { companyId } = req.query;
    const targetCompanyId = companyId || req.user.companyId;

    // Total events in last 7 days
    const totalResult = await db.query(
      `SELECT COUNT(*) as total FROM events 
       WHERE company_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
      [targetCompanyId]
    );

    // Blocked events
    const blockedResult = await db.query(
      `SELECT COUNT(*) as blocked FROM events 
       WHERE company_id = $1 AND action = 'quarantine' AND created_at > NOW() - INTERVAL '7 days'`,
      [targetCompanyId]
    );

    // Suspicious events
    const suspiciousResult = await db.query(
      `SELECT COUNT(*) as suspicious FROM events 
       WHERE company_id = $1 AND verdict = 'suspicious' AND created_at > NOW() - INTERVAL '7 days'`,
      [targetCompanyId]
    );

    // Average severity
    const avgSeverityResult = await db.query(
      `SELECT AVG(severity) as avg_severity FROM events 
       WHERE company_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
      [targetCompanyId]
    );

    // Events by day (last 30 days)
    const timeSeriesResult = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM events 
       WHERE company_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) 
       ORDER BY date`,
      [targetCompanyId]
    );

    res.json({
      stats: {
        total: parseInt(totalResult.rows[0].total),
        blocked: parseInt(blockedResult.rows[0].blocked),
        suspicious: parseInt(suspiciousResult.rows[0].suspicious),
        avgSeverity: parseFloat(avgSeverityResult.rows[0].avg_severity) || 0,
        timeSeries: timeSeriesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { companyId } = req.query;
    const targetCompanyId = companyId || req.user.companyId;

    const result = await db.query(
      `SELECT id, email, role, created_at FROM users WHERE company_id = $1 ORDER BY created_at DESC`,
      [targetCompanyId]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/blockdomain', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // For now, just log it - in production, this would update a blocklist
    console.log('Blocking domain:', domain);

    res.json({ message: 'Domain blocked successfully', domain });
  } catch (error) {
    console.error('Block domain error:', error);
    res.status(500).json({ error: 'Failed to block domain' });
  }
});

module.exports = router;
