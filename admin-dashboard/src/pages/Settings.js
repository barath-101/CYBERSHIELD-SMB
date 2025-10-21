import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, TextField, Switch, FormControlLabel, Button, Alert
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';

function Settings({ onLogout }) {
  const [policy, setPolicy] = useState({
    threshold: 0.7,
    auto_quarantine: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const data = await api.getPolicy(user.companyId);
      setPolicy(data);
    } catch (error) {
      console.error('Failed to load policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await api.updatePolicy(user.companyId, policy);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Policy
            </Typography>

            <Box sx={{ mt: 3 }}>
              <TextField
                label="Detection Threshold"
                type="number"
                value={policy.threshold}
                onChange={(e) => setPolicy({ ...policy, threshold: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                fullWidth
                helperText="Confidence threshold for threat detection (0.0 - 1.0)"
                sx={{ mb: 3 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={policy.auto_quarantine}
                    onChange={(e) => setPolicy({ ...policy, auto_quarantine: e.target.checked })}
                  />
                }
                label="Auto-Quarantine Malicious Content"
              />

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, mb: 3 }}>
                When enabled, malicious content will be automatically blocked without user interaction
              </Typography>

              {message && (
                <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Layout>
  );
}

export default Settings;
