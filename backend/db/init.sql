-- CyberShield SMB Database Schema

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table (extension installations)
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    agent_key VARCHAR(255) UNIQUE NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (security events)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- 'image' or 'popup'
    payload JSONB NOT NULL,
    severity INTEGER DEFAULT 1,
    confidence NUMERIC(3,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'pending',
    verdict VARCHAR(50), -- 'safe', 'suspicious', 'malicious'
    action VARCHAR(50), -- 'allow', 'quarantine', 'alert'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain events table
CREATE TABLE IF NOT EXISTS blockchain_events (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) NOT NULL,
    chain VARCHAR(50) DEFAULT 'polygon-mumbai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table (for AI improvement)
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    label VARCHAR(50) NOT NULL, -- 'false_positive', 'false_negative', 'correct'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
    company_id INTEGER PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
    threshold NUMERIC(3,2) DEFAULT 0.7,
    auto_quarantine BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_events_company_id ON events(company_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_blockchain_events_event_id ON blockchain_events(event_id);
CREATE INDEX idx_feedback_event_id ON feedback(event_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_agents_company_id ON agents(company_id);

-- Insert demo company
INSERT INTO companies (name) VALUES ('Demo Corporation') ON CONFLICT DO NOTHING;

-- Insert demo user (password: demo123)
INSERT INTO users (email, password_hash, company_id, role) 
SELECT 'admin@demo.com', '$2b$10$rKvVXZKFw8HBHv5xGpXzIeX8O7qN6N6CmK8XqFh9yQH9BqY9RqY9R', id, 'admin'
FROM companies WHERE name = 'Demo Corporation'
ON CONFLICT (email) DO NOTHING;

-- Insert demo policy
INSERT INTO policies (company_id, threshold, auto_quarantine)
SELECT id, 0.7, true
FROM companies WHERE name = 'Demo Corporation'
ON CONFLICT (company_id) DO NOTHING;
