// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecurityAudit
 * @dev Smart contract for immutable security event logging on Polygon
 */
contract SecurityAudit {
    
    struct SecurityEvent {
        bytes32 eventHash;      // SHA256 hash of event metadata
        string companyId;        // Company identifier
        uint8 severity;          // Severity level (1-10)
        uint256 timestamp;       // Block timestamp
        address reporter;        // Address that logged the event
    }
    
    // Mapping from eventId to SecurityEvent
    mapping(bytes32 => SecurityEvent) public events;
    
    // Array to track all event IDs
    bytes32[] public eventIds;
    
    // Counter for events per company
    mapping(string => uint256) public companyEventCount;
    
    // Events
    event EventLogged(
        bytes32 indexed eventId,
        bytes32 eventHash,
        string companyId,
        uint8 severity,
        uint256 timestamp,
        address reporter
    );
    
    /**
     * @dev Log a security event to the blockchain
     * @param eventHash SHA256 hash of the event metadata (no PII)
     * @param companyId Company identifier string
     * @param severity Severity level from 1 to 10
     * @return eventId Unique identifier for this event
     */
    function logEvent(
        bytes32 eventHash,
        string memory companyId,
        uint8 severity
    ) public returns (bytes32) {
        require(severity >= 1 && severity <= 10, "Severity must be between 1 and 10");
        require(bytes(companyId).length > 0, "Company ID cannot be empty");
        
        // Generate unique event ID
        bytes32 eventId = keccak256(
            abi.encodePacked(
                eventHash,
                companyId,
                severity,
                block.timestamp,
                msg.sender
            )
        );
        
        // Ensure event doesn't already exist
        require(events[eventId].timestamp == 0, "Event already exists");
        
        // Store event
        events[eventId] = SecurityEvent({
            eventHash: eventHash,
            companyId: companyId,
            severity: severity,
            timestamp: block.timestamp,
            reporter: msg.sender
        });
        
        // Track event ID
        eventIds.push(eventId);
        
        // Increment company counter
        companyEventCount[companyId]++;
        
        // Emit event
        emit EventLogged(
            eventId,
            eventHash,
            companyId,
            severity,
            block.timestamp,
            msg.sender
        );
        
        return eventId;
    }
    
    /**
     * @dev Get event details by event ID
     * @param eventId The unique event identifier
     * @return eventHash The hash of event metadata
     * @return companyId The company identifier
     * @return severity The severity level
     * @return timestamp When the event was logged
     * @return reporter Who logged the event
     */
    function getEvent(bytes32 eventId) 
        public 
        view 
        returns (
            bytes32 eventHash,
            string memory companyId,
            uint8 severity,
            uint256 timestamp,
            address reporter
        ) 
    {
        SecurityEvent memory evt = events[eventId];
        require(evt.timestamp != 0, "Event does not exist");
        
        return (
            evt.eventHash,
            evt.companyId,
            evt.severity,
            evt.timestamp,
            evt.reporter
        );
    }
    
    /**
     * @dev Get total number of events logged
     * @return Total event count
     */
    function getTotalEvents() public view returns (uint256) {
        return eventIds.length;
    }
    
    /**
     * @dev Get number of events for a specific company
     * @param companyId The company identifier
     * @return Event count for the company
     */
    function getCompanyEventCount(string memory companyId) 
        public 
        view 
        returns (uint256) 
    {
        return companyEventCount[companyId];
    }
    
    /**
     * @dev Get event ID by index
     * @param index Index in the eventIds array
     * @return Event ID at that index
     */
    function getEventIdByIndex(uint256 index) 
        public 
        view 
        returns (bytes32) 
    {
        require(index < eventIds.length, "Index out of bounds");
        return eventIds[index];
    }
}
