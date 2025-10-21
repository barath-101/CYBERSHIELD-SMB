const { Web3 } = require('web3');
const crypto = require('crypto');
const config = require('../config');

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    if (!config.blockchain.privateKey || !config.blockchain.contractAddress) {
      console.warn('Blockchain config incomplete, skipping initialization');
      return;
    }

    try {
      this.web3 = new Web3(config.blockchain.rpcUrl);
      this.account = this.web3.eth.accounts.privateKeyToAccount('0x' + config.blockchain.privateKey);
      this.web3.eth.accounts.wallet.add(this.account);

      // Simple ABI for SecurityAudit contract
      const abi = [
        {
          "inputs": [
            { "internalType": "bytes32", "name": "eventHash", "type": "bytes32" },
            { "internalType": "string", "name": "companyId", "type": "string" },
            { "internalType": "uint8", "name": "severity", "type": "uint8" }
          ],
          "name": "logEvent",
          "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      this.contract = new this.web3.eth.Contract(abi, config.blockchain.contractAddress);
      this.initialized = true;
      console.log('Blockchain service initialized');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
    }
  }

  hashEventMetadata(eventId, companyId, severity, timestamp) {
    const data = `${eventId}:${companyId}:${severity}:${timestamp}`;
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  }

  async logEvent(eventId, companyId, severity) {
    await this.initialize();

    if (!this.initialized) {
      console.warn('Blockchain service not initialized, skipping');
      return null;
    }

    try {
      const timestamp = Date.now();
      const eventHash = this.hashEventMetadata(eventId, companyId, severity, timestamp);

      const tx = await this.contract.methods
        .logEvent(eventHash, companyId.toString(), severity)
        .send({
          from: this.account.address,
          gas: 200000,
        });

      console.log('Blockchain event logged:', tx.transactionHash);
      return tx.transactionHash;
    } catch (error) {
      console.error('Blockchain logging error:', error);
      return null;
    }
  }
}

module.exports = new BlockchainService();
