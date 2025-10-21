const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurityAudit", function () {
  let securityAudit;
  let owner;
  let addr1;
  
  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const SecurityAudit = await ethers.getContractFactory("SecurityAudit");
    securityAudit = await SecurityAudit.deploy();
    await securityAudit.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await securityAudit.getAddress()).to.be.properAddress;
    });
    
    it("Should start with zero events", async function () {
      expect(await securityAudit.getTotalEvents()).to.equal(0);
    });
  });
  
  describe("Event Logging", function () {
    it("Should log an event successfully", async function () {
      const eventHash = ethers.keccak256(ethers.toUtf8Bytes("test-metadata"));
      const companyId = "1";
      const severity = 5;
      
      await expect(securityAudit.logEvent(eventHash, companyId, severity))
        .to.emit(securityAudit, "EventLogged");
      
      expect(await securityAudit.getTotalEvents()).to.equal(1);
      expect(await securityAudit.getCompanyEventCount(companyId)).to.equal(1);
    });
    
    it("Should reject invalid severity", async function () {
      const eventHash = ethers.keccak256(ethers.toUtf8Bytes("test-metadata"));
      
      await expect(
        securityAudit.logEvent(eventHash, "1", 0)
      ).to.be.revertedWith("Severity must be between 1 and 10");
      
      await expect(
        securityAudit.logEvent(eventHash, "1", 11)
      ).to.be.revertedWith("Severity must be between 1 and 10");
    });
    
    it("Should reject empty company ID", async function () {
      const eventHash = ethers.keccak256(ethers.toUtf8Bytes("test-metadata"));
      
      await expect(
        securityAudit.logEvent(eventHash, "", 5)
      ).to.be.revertedWith("Company ID cannot be empty");
    });
    
    it("Should retrieve event details correctly", async function () {
      const eventHash = ethers.keccak256(ethers.toUtf8Bytes("test-metadata"));
      const companyId = "1";
      const severity = 8;
      
      const tx = await securityAudit.logEvent(eventHash, companyId, severity);
      const receipt = await tx.wait();
      
      // Get event ID from emitted event
      const event = receipt.logs[0];
      const eventId = event.args[0];
      
      const [
        retrievedHash,
        retrievedCompanyId,
        retrievedSeverity,
        timestamp,
        reporter
      ] = await securityAudit.getEvent(eventId);
      
      expect(retrievedHash).to.equal(eventHash);
      expect(retrievedCompanyId).to.equal(companyId);
      expect(retrievedSeverity).to.equal(severity);
      expect(reporter).to.equal(owner.address);
    });
    
    it("Should handle multiple events from different companies", async function () {
      const eventHash1 = ethers.keccak256(ethers.toUtf8Bytes("event1"));
      const eventHash2 = ethers.keccak256(ethers.toUtf8Bytes("event2"));
      
      await securityAudit.logEvent(eventHash1, "1", 5);
      await securityAudit.logEvent(eventHash2, "2", 7);
      
      expect(await securityAudit.getTotalEvents()).to.equal(2);
      expect(await securityAudit.getCompanyEventCount("1")).to.equal(1);
      expect(await securityAudit.getCompanyEventCount("2")).to.equal(1);
    });
  });
});
