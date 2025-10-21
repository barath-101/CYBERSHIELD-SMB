const express = require('express');
const db = require('../config/database');

const router = express.Router();

router.post('/seed', async (req, res) => {
  try {
    // Get demo company
    const companyResult = await db.query(
      "SELECT id FROM companies WHERE name = 'Demo Corporation'"
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Demo company not found' });
    }

    const companyId = companyResult.rows[0].id;

    // Create some synthetic events
    const sampleEvents = [
      {
        type: 'image',
        verdict: 'malicious',
        severity: 8,
        confidence: 0.92,
        action: 'quarantine',
        payload: {
          page_url: 'https://fake-bank-site.com',
          src_url: 'https://fake-bank-site.com/images/fake-login.jpg',
          ai_result: {
            verdict: 'malicious',
            severity: 8,
            confidence: 0.92,
            extracted_text: 'Enter your credit card details',
            reason_codes: ['suspicious_url', 'known_malicious_domain'],
            action: 'quarantine',
          },
        },
      },
      {
        type: 'popup',
        verdict: 'suspicious',
        severity: 6,
        confidence: 0.75,
        action: 'alert',
        payload: {
          page_url: 'https://legitimate-site.com',
          raw_text: 'Your account has been suspended. Click here to verify.',
          field_labels: ['email', 'password', 'phone'],
          ai_result: {
            verdict: 'suspicious',
            severity: 6,
            confidence: 0.75,
            reason_codes: ['suspicious_text', 'sensitive_request'],
            action: 'alert',
          },
        },
      },
      {
        type: 'image',
        verdict: 'safe',
        severity: 1,
        confidence: 0.95,
        action: 'allow',
        payload: {
          page_url: 'https://trusted-site.com',
          src_url: 'https://trusted-site.com/logo.png',
          ai_result: {
            verdict: 'safe',
            severity: 1,
            confidence: 0.95,
            extracted_text: '',
            reason_codes: [],
            action: 'allow',
          },
        },
      },
    ];

    const insertedEvents = [];
    for (const event of sampleEvents) {
      const result = await db.query(
        `INSERT INTO events (company_id, type, payload, severity, confidence, status, verdict, action) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          companyId,
          event.type,
          JSON.stringify(event.payload),
          event.severity,
          event.confidence,
          'completed',
          event.verdict,
          event.action,
        ]
      );
      insertedEvents.push({ id: result.rows[0].id, ...event });
    }

    res.json({
      message: 'Demo data seeded successfully',
      events: insertedEvents,
    });
  } catch (error) {
    console.error('Seed demo error:', error);
    res.status(500).json({ error: 'Failed to seed demo data' });
  }
});

router.post('/simulate', async (req, res) => {
  try {
    // Get demo company
    const companyResult = await db.query(
      "SELECT id FROM companies WHERE name = 'Demo Corporation'"
    );
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Demo company not found' });
    }

    const companyId = companyResult.rows[0].id;

    // Create a simulated attack event
    const result = await db.query(
      `INSERT INTO events (company_id, type, payload, severity, confidence, status, verdict, action) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        companyId,
        'popup',
        JSON.stringify({
          page_url: 'https://simulated-phishing.com',
          raw_text: 'URGENT: Your account will be locked in 24 hours. Verify now!',
          field_labels: ['ssn', 'credit_card', 'cvv'],
          ai_result: {
            verdict: 'malicious',
            severity: 9,
            confidence: 0.98,
            reason_codes: ['phishing_pattern', 'sensitive_request', 'suspicious_domain'],
            action: 'quarantine',
          },
        }),
        9,
        0.98,
        'completed',
        'malicious',
        'quarantine',
      ]
    );

    res.json({
      message: 'Attack simulated successfully',
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Simulate demo error:', error);
    res.status(500).json({ error: 'Failed to simulate attack' });
  }
});

module.exports = router;
