import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { format } from 'date-fns';

function Users({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const data = await api.getUsers(user.companyId);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Users
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'PPpp')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  );
}

export default Users;
