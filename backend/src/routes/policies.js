const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

const updatePolicySchema = Joi.object({
  threshold: Joi.number().min(0).max(1).optional(),
  auto_quarantine: Joi.boolean().optional(),
});

router.get('/:companyId', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Users can only see their own company policy, admins can see any
    if (req.user.role !== 'admin' && parseInt(companyId) !== req.user.companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      'SELECT * FROM policies WHERE company_id = $1',
      [companyId]
    );

    if (result.rows.length === 0) {
      // Return default policy if none exists
      return res.json({ 
        policy: { 
          company_id: parseInt(companyId), 
          threshold: 0.7, 
          auto_quarantine: false 
        } 
      });
    }

    res.json({ policy: result.rows[0] });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

router.post('/:companyId', authMiddleware, validateRequest(updatePolicySchema), async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Users can only update their own company policy
    if (req.user.role !== 'admin' && parseInt(companyId) !== req.user.companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { threshold, auto_quarantine } = req.body;

    const result = await db.query(
      `INSERT INTO policies (company_id, threshold, auto_quarantine) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (company_id) 
       DO UPDATE SET threshold = COALESCE($2, policies.threshold), 
                     auto_quarantine = COALESCE($3, policies.auto_quarantine),
                     updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [companyId, threshold, auto_quarantine]
    );

    res.json({ policy: result.rows[0] });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

module.exports = router;
