import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';


export default function Profile() {

  const { user, setUser, setIsAuthenticated, IsAuthenticated } = useAuth();
  console.log(user);

  return (
    <Grid container spacing={2} justify="center" justifyContent="center" alignItems="stretch">
      <Grid item direction="column" xs={4}>
        <h1>Hello</h1>
      </Grid>
      <Grid item direction="column" xs={8}>
        <h1>Hello</h1>
      </Grid>
    </Grid>
    // <h1>{user.firstName}</h1>
  );
    
}
