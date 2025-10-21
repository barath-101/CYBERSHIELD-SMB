const axios = require('axios');
const config = require('../config');

class AIServiceClient {
  constructor() {
    this.baseUrl = config.ai.serviceUrl;
    this.timeout = 30000; // 30 seconds
  }

  async infer(payload) {
    try {
      const response = await axios.post(`${this.baseUrl}/infer`, payload, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('AI Service error:', error.message);
      
      // Return a fallback response if AI service is unavailable
      return {
        verdict: 'safe',
        severity: 1,
        confidence: 0.5,
        extracted_text: '',
        suspect_regions: [],
        reason_codes: ['ai_service_unavailable'],
        action: 'allow',
      };
    }
  }

  async inferImage(data, context) {
    return this.infer({
      type: 'image',
      data,
      context,
    });
  }

  async inferPopup(data, context) {
    return this.infer({
      type: 'popup',
      data,
      context,
    });
  }
}

module.exports = new AIServiceClient();
