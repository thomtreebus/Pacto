import React from 'react';
import { useAuth } from '../providers/AuthProvider';

export default function Profile() {

  const { user, setUser, setIsAuthenticated, IsAuthenticated } = useAuth();
  console.log(user);

  return (
    <h1>Profile</h1>
    // <h1>{user.firstName}</h1>
  );
    
}
