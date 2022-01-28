import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import CreatePostCard from '../components/CreatePostCard';

export default function Feed() {
  const { user } = useAuth()
  console.log(user)
  return (
    <CreatePostCard />
  );
}
