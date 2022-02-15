
import React from 'react';
import Axios from 'axios';
import { useState } from "react";
import { useAuth } from '../providers/AuthProvider';
import { Image } from 'cloudinary-react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import LocationIcon from '@mui/icons-material/LocationOn';
import CourseIcon from '@mui/icons-material/School';
import PhotoIcon from '@mui/icons-material/AddAPhoto';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Divider } from '@mui/material';
import { useHistory, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import Loading from "./Loading";
import { useEffect } from "react";

export default function Profile () {
  const [user, setUser] = useState({});
  const { id } = useParams();

  const { isLoading, data } = useQuery("userData", () =>
    fetch(`${process.env.REACT_APP_URL}/users/${id}`, {
      credentials: "include",
    }).then((res) => res.json())
  );
  
  useEffect(() => {
		if (data) {
      setUser(data.message);
      console.log(data)
		}
  }, [data]);
  
  if (isLoading) {
		return <Loading />;
  } else {
    
  }

  return (
    // <h1>{user._id}</h1>

    <Grid
      container
      p={4}
      spacing={2}
      justify="center"
      justifyContent="center"
      alignItems="stretch">
      <Grid item direction="column" xs={4}>
        <Image
          style={{width: "100%", minWidth: "50%", minHeight: "25%", borderRadius: "10px", overflow: "hidden", position: "relative", }}
          alt="Profile Picture"
          cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
          publicID={user.image}
        >
        </Image>
      </Grid>

      <Grid item direction="column" xs={8}>
        <h1>{user.firstName} {user.lastName} </h1>
      </Grid>
    </Grid>
  )
}