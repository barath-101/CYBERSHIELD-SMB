# CyberShield Smart Contracts

Solidity smart contracts for immutable security event logging on Polygon blockchain.

## Overview

The SecurityAudit contract provides a decentralized, tamper-proof audit trail for security events detected by CyberShield. It stores only hashed metadata to ensure privacy while maintaining verifiability.

## Contract: SecurityAudit

### Features

- **Immutable Event Logging**: Once logged, events cannot be modified or deleted
- **Privacy-Preserving**: Stores only SHA256 hashes of event metadata (no PII)
- **Multi-Company Support**: Tracks events per company
- **Event Verification**: Anyone can verify event authenticity on-chain
- **Gas Optimized**: Efficient storage patterns for cost-effective operations

### Contract Methods

#### `logEvent(bytes32 eventHash, string companyId, uint8 severity)`
Logs a security event to the blockchain.

**Parameters:**
- `eventHash`: SHA256 hash of event metadata
- `companyId`: Company identifier
- `severity`: Severity level (1-10)

**Returns:** `eventId` - Unique identifier for the event

#### `getEvent(bytes32 eventId)`
Retrieves event details by ID.

**Returns:**
- `eventHash`: The hash of event metadata
- `companyId`: Company identifier
- `severity`: Severity level
- `timestamp`: When event was logged
- `reporter`: Address that logged the event

#### `getTotalEvents()`
Returns total number of events logged.

#### `getCompanyEventCount(string companyId)`
Returns number of events for a specific company.

#### `getEventIdByIndex(uint256 index)`
Returns event ID at a specific index.

## Setup

### Prerequisites

- Node.js 18+
- NPM or Yarn
- Polygon Mumbai testnet RPC URL
- Private key with Mumbai MATIC for gas

### Installation

```bash
cd contracts
npm install
```

### Configuration

1. Copy environment variables from root `.env.example`:
```bash
ETH_RPC_URL=https://rpc-mumbai.maticvigil.com
ETH_PRIVATE_KEY=your_private_key_here
```

2. Get Mumbai testnet MATIC from faucet:
   - https://faucet.polygon.technology/

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

Expected output:
```
SecurityAudit
  Deployment
    ✓ Should deploy successfully
    ✓ Should start with zero events
  Event Logging
    ✓ Should log an event successfully
    ✓ Should reject invalid severity
    ✓ Should reject empty company ID
    ✓ Should retrieve event details correctly
    ✓ Should handle multiple events from different companies

7 passing
```

### Deploy to Mumbai Testnet

```bash
npm run deploy:mumbai
```

Save the deployed contract address to your `.env` file:
```
CONTRACT_ADDRESS=0x...
```

### Deploy to Local Hardhat Network

1. Start local node:
```bash
npx hardhat node
```

2. In another terminal, deploy:
```bash
npm run deploy:local
```

## Usage Example

### From JavaScript/Node.js

```javascript
const { ethers } = require('ethers');

// Connect to Polygon Mumbai
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, provider);

// Load contract
const contractAddress = process.env.CONTRACT_ADDRESS;
const abi = [...]; // Import from artifacts
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Hash event metadata
const metadata = { eventId: 123, companyId: 1, severity: 8 };
const metadataString = JSON.stringify(metadata);
const eventHash = ethers.keccak256(ethers.toUtf8Bytes(metadataString));

// Log event
const tx = await contract.logEvent(eventHash, "1", 8);
const receipt = await tx.wait();

console.log('Transaction hash:', receipt.hash);
console.log('Event logged on-chain!');
```

### From Backend (Web3.js)

```javascript
const Web3 = require('web3');

const web3 = new Web3(process.env.ETH_RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.ETH_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

const contract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);

// Log event
const eventHash = web3.utils.sha3(JSON.stringify(metadata));
const tx = await contract.methods.logEvent(eventHash, "1", 8).send({
  from: account.address,
  gas: 200000
});

console.log('Transaction:', tx.transactionHash);
```

## Verification on Polygonscan

After deployment, verify the contract:

```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

View your contract on Mumbai Polygonscan:
https://mumbai.polygonscan.com/address/<CONTRACT_ADDRESS>

## Security Considerations

1. **Privacy**: Only hashes are stored on-chain, never raw event data
2. **Immutability**: Events cannot be deleted or modified once logged
3. **Access Control**: Anyone can log events (consider adding access control in production)
4. **Gas Costs**: Each event log costs ~100k gas (approx $0.01-0.05 on Mumbai)
5. **Rate Limiting**: Implement rate limiting in backend to prevent spam

## Gas Costs (Mumbai Testnet)

- Deploy contract: ~1.5M gas
- Log event: ~100k gas per event
- Read operations: Free (view functions)

## Upgradability

This contract is not upgradeable to ensure immutability of audit logs. For new features:
1. Deploy new contract version
2. Migrate backend to use new contract
3. Keep old contract for historical records

## License

MIT
