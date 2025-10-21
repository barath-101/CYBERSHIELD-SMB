const hre = require("hardhat");

async function main() {
  console.log("Deploying SecurityAudit contract...");

  // Get the contract factory
  const SecurityAudit = await hre.ethers.getContractFactory("SecurityAudit");
  
  // Deploy the contract
  const securityAudit = await SecurityAudit.deploy();
  
  await securityAudit.waitForDeployment();
  
  const address = await securityAudit.getAddress();
  
  console.log("SecurityAudit deployed to:", address);
  console.log("\nSave this address to your .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  
  // Wait for a few block confirmations
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await securityAudit.deploymentTransaction().wait(5);
    console.log("Confirmed!");
    
    // Verify contract on Polygonscan (optional)
    console.log("\nTo verify the contract, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${address}`);
  }
  
  // Test the contract
  console.log("\nTesting contract...");
  const testEventHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test-event-metadata"));
  const tx = await securityAudit.logEvent(testEventHash, "1", 5);
  await tx.wait();
  console.log("Test event logged successfully!");
  
  const totalEvents = await securityAudit.getTotalEvents();
  console.log(`Total events: ${totalEvents}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
