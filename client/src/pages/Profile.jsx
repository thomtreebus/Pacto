
import React from 'react';
import { useState } from "react";
import { Image } from 'cloudinary-react';
import Grid from '@mui/material/Grid';
import {useParams } from "react-router-dom";
import { useQuery } from "react-query";
import Loading from "./Loading";
import { useEffect } from "react";
import Typography from "@mui/material/Typography";
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

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
          publicID={user.image}>
        </Image>
        <Typography variant="body1"> {user.instagram} </Typography>
      </Grid>

      <Grid item direction="column" xs={8}>
        <Typography variant="h4">{user.firstName} {user.lastName}</Typography>
        <Typography variant="subtitle1" sx={{ color: "#1976d2" }}>  King's College London </Typography>
        <Typography variant="body1"> {user.bio} </Typography>

      </Grid>
    </Grid>
  )
}