import React from 'react';
import { useState } from 'react';
import AppBar from '../components/AppBar';

import { useHistory, useParams } from "react-router-dom";

export default function Profile() {

  const { id } = useParams();
  const { data: user, error, isPending };
  const history = useHistory();

  const []

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('update profile!');
    console.log()
  }

  return (
    <h1>Profile</h1>
  );
    
}
