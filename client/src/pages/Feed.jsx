import React from 'react';
import { useAuth } from '../providers/AuthProvider';

export default function Feed() {
  const { user } = useAuth()
  console.log(user)
  return (
    <h1>(under construction)</h1>
  );
}
