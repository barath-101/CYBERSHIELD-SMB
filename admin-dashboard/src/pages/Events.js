import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { format } from 'date-fns';

function Events({ onLogout }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents({ limit: 50 });
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (eventId) => {
    try {
      await api.acknowledgeEvent(eventId);
      await loadEvents();
    } catch (error) {
      alert('Failed to acknowledge event');
    }
  };

  const handleFalsePositive = async (eventId) => {
    try {
      await api.submitFeedback(eventId, 'false_positive', '');
      await loadEvents();
      setSelectedEvent(null);
      alert('Feedback submitted');
    } catch (error) {
      alert('Failed to submit feedback');
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'malicious': return 'error';
      case 'suspicious': return 'warning';
      case 'safe': return 'success';
      default: return 'default';
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Security Events
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Verdict</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      {format(new Date(event.created_at), 'PPpp')}
                    </TableCell>
                    <TableCell>{event.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={event.verdict} 
                        color={getVerdictColor(event.verdict)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{event.severity}/10</TableCell>
                    <TableCell>{(event.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      <Chip label={event.status} size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => setSelectedEvent(event)}>
                        View
                      </Button>
                      {event.status !== 'acknowledged' && (
                        <Button 
                          size="small" 
                          onClick={() => handleAcknowledge(event.id)}
                        >
                          Ack
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Event Detail Dialog */}
        <Dialog 
          open={!!selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Event Details</DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box>
                <Typography><strong>Type:</strong> {selectedEvent.type}</Typography>
                <Typography><strong>Verdict:</strong> {selectedEvent.verdict}</Typography>
                <Typography><strong>Severity:</strong> {selectedEvent.severity}/10</Typography>
                <Typography><strong>Confidence:</strong> {(selectedEvent.confidence * 100).toFixed(0)}%</Typography>
                <Typography sx={{ mt: 2 }}>
                  <strong>Payload:</strong>
                </Typography>
                <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto' }}>
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
                {selectedEvent.tx_hash && (
                  <Typography sx={{ mt: 2 }}>
                    <strong>Blockchain TX:</strong>{' '}
                    <a 
                      href={`https://mumbai.polygonscan.com/tx/${selectedEvent.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedEvent.tx_hash}
                    </a>
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleFalsePositive(selectedEvent.id)}>
              Mark False Positive
            </Button>
            <Button onClick={() => setSelectedEvent(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export default Events;
