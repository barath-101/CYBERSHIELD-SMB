const db = require('../config/database');
const aiClient = require('./aiClient');
const blockchainService = require('./blockchainService');
const redisClient = require('../config/redis');

class ScanService {
  async scanImage(payload, user) {
    try {
      const { thumbnail_base64, src_url, page_url, mime, metadata } = payload;
      
      // Create initial event record
      const eventResult = await db.query(
        `INSERT INTO events (company_id, agent_id, type, payload, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [user.companyId, metadata.agentId || null, 'image', JSON.stringify(payload), 'pending']
      );

      const eventId = eventResult.rows[0].id;

      // Get company policy
      const policyResult = await db.query(
        'SELECT threshold, auto_quarantine FROM policies WHERE company_id = $1',
        [user.companyId]
      );

      const policy = policyResult.rows[0] || { threshold: 0.7, auto_quarantine: false };

      // Call AI service
      const aiResult = await aiClient.inferImage(
        { thumbnail_base64, src_url, page_url, mime, metadata },
        { companyId: user.companyId, agentId: metadata.agentId, policy }
      );

      // Update event with AI results
      await db.query(
        `UPDATE events SET verdict = $1, severity = $2, confidence = $3, 
         action = $4, status = $5, payload = $6 WHERE id = $7`,
        [
          aiResult.verdict,
          aiResult.severity,
          aiResult.confidence,
          aiResult.action,
          'completed',
          JSON.stringify({ ...payload, ai_result: aiResult }),
          eventId,
        ]
      );

      // If malicious and high confidence, log to blockchain
      if (aiResult.verdict === 'malicious' && aiResult.confidence > 0.8) {
        try {
          const txHash = await blockchainService.logEvent(eventId, user.companyId, aiResult.severity);
          if (txHash) {
            await db.query(
              'INSERT INTO blockchain_events (event_id, tx_hash, chain) VALUES ($1, $2, $3)',
              [eventId, txHash, 'polygon-mumbai']
            );
          }
        } catch (blockchainError) {
          console.error('Blockchain logging error:', blockchainError);
        }
      }

      return {
        eventId,
        ...aiResult,
      };
    } catch (error) {
      console.error('Scan image error:', error);
      throw error;
    }
  }

  async scanPopup(payload, user) {
    try {
      const { page_url, raw_text, field_labels } = payload;
      
      // Create initial event record
      const eventResult = await db.query(
        `INSERT INTO events (company_id, agent_id, type, payload, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [user.companyId, payload.agentId || null, 'popup', JSON.stringify(payload), 'pending']
      );

      const eventId = eventResult.rows[0].id;

      // Get company policy
      const policyResult = await db.query(
        'SELECT threshold, auto_quarantine FROM policies WHERE company_id = $1',
        [user.companyId]
      );

      const policy = policyResult.rows[0] || { threshold: 0.7, auto_quarantine: false };

      // Call AI service
      const aiResult = await aiClient.inferPopup(
        { page_url, raw_text, field_labels },
        { companyId: user.companyId, agentId: payload.agentId, policy }
      );

      // Update event with AI results
      await db.query(
        `UPDATE events SET verdict = $1, severity = $2, confidence = $3, 
         action = $4, status = $5, payload = $6 WHERE id = $7`,
        [
          aiResult.verdict,
          aiResult.severity,
          aiResult.confidence,
          aiResult.action,
          'completed',
          JSON.stringify({ ...payload, ai_result: aiResult }),
          eventId,
        ]
      );

      // If malicious and high confidence, log to blockchain
      if (aiResult.verdict === 'malicious' && aiResult.confidence > 0.8) {
        try {
          const txHash = await blockchainService.logEvent(eventId, user.companyId, aiResult.severity);
          if (txHash) {
            await db.query(
              'INSERT INTO blockchain_events (event_id, tx_hash, chain) VALUES ($1, $2, $3)',
              [eventId, txHash, 'polygon-mumbai']
            );
          }
        } catch (blockchainError) {
          console.error('Blockchain logging error:', blockchainError);
        }
      }

      return {
        eventId,
        ...aiResult,
      };
    } catch (error) {
      console.error('Scan popup error:', error);
      throw error;
    }
  }

  async getRecentEvents(companyId, limit = 10, offset = 0) {
    const result = await db.query(
      `SELECT e.*, b.tx_hash, b.chain 
       FROM events e 
       LEFT JOIN blockchain_events b ON e.id = b.event_id 
       WHERE e.company_id = $1 
       ORDER BY e.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset]
    );

    return result.rows;
  }
}

module.exports = new ScanService();
