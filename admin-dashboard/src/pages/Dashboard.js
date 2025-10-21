import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Button, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import BlockIcon from '@mui/icons-material/Block';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Layout from '../components/Layout';
import api from '../services/api';

function Dashboard({ onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const data = await api.getStats(user.companyId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      await api.seedDemo();
      await loadStats();
      alert('Demo data seeded successfully!');
    } catch (error) {
      alert('Failed to seed demo data');
    }
  };

  const handleSimulateAttack = async () => {
    try {
      await api.simulateAttack();
      await loadStats();
      alert('Attack simulated! Check events page.');
    } catch (error) {
      alert('Failed to simulate attack');
    }
  };

  if (loading) {
    return <Layout onLogout={onLogout}><Typography>Loading...</Typography></Layout>;
  }

  return (
    <Layout onLogout={onLogout}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Dashboard
          </Typography>
          <Box>
            <Button variant="outlined" onClick={handleSeedDemo} sx={{ mr: 1 }}>
              Seed Demo Data
            </Button>
            <Button variant="contained" color="error" onClick={handleSimulateAttack}>
              Simulate Attack
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Events (7d)
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.total || 0}
                </Typography>
                <AssessmentIcon color="primary" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Blocked
                </Typography>
                <Typography variant="h4" component="div" color="error.main">
                  {stats?.blocked || 0}
                </Typography>
                <BlockIcon color="error" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Suspicious
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  {stats?.suspicious || 0}
                </Typography>
                <WarningIcon color="warning" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Severity
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.avgSeverity?.toFixed(1) || '0.0'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  out of 10
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Time Series Chart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Events Timeline (Last 30 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.timeSeries || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0B61A4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Container>
    </Layout>
  );
}

export default Dashboard;
