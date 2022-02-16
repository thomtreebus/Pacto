
import React from 'react';
import { useState } from "react";
import { Image } from 'cloudinary-react';
import { useHistory } from "react-router-dom";
import Grid from '@mui/material/Grid';
import {useParams } from "react-router-dom";
import { useQuery } from "react-query";
import Loading from "./Loading";
import { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupIcon from '@mui/icons-material/Group';

export default function Profile() {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const history = useHistory();

  const { isLoading, data } = useQuery("userData", () =>
    fetch(`${process.env.REACT_APP_URL}/users/${id}`, {
      credentials: "include",
    }).then((res) => res.json())
  );
  
  useEffect(() => {
    if (data) {
      if (data.errors.length) {
        history.replace("/not-found");
      }
      setUser(data.message);
      console.log(data);
    }
  }, [data]);
  
  if (isLoading) {
    return <Loading />;
  }

  return (
     user && (<Grid
      container
      p={4}
      spacing={2}
      justify="center"
      justifyContent="center"
      alignItems="stretch"
    >
      <Grid container item direction="column" xs={8}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{}}>
          {/* {user && <Chip label={`${user.friends.length} Friends`} icon={<GroupIcon />} variant="outlined" />} */}

          <Image
            style={{ width: "100px", height: "100px", border: "3px solid #616161", borderRadius: "180px", overflow: "hidden", position: "relative", }}
            alt="Profile Picture"
            cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
            publicID={user.image}>
          </Image>
          <Stack direction="column" alignItems="left" sx={{}}>
            <Typography variant="h4">{user.firstName} {user.lastName}</Typography>
            <Typography variant="subtitle1" sx={{ color: "#1976d2", marginTop: "2px" }}>  Engineering student at King's College London </Typography>
            <Typography variant="subtitle1" sx={{ color: "#616161", }}>  {user.location} </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }}></Divider>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ marginTop: "2px" }}>
          <Chip label="username" icon={<InstagramIcon />} variant="outlined" component="a" target="_blank" clickable href={`https://www.instagram.com/`} />
          <Chip label={`${user.firstName} ${user.lastName}`} icon={<LinkedInIcon />} variant="outlined" component="a" target="_blank" clickable href={`https://www.linkedin.com/`} />
          <Chip label="+44 (0) 123456789" icon={<WhatsAppIcon />} variant="outlined" />
        </Stack>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }}></Divider>
        <Typography variant="body1" sx={{}}> {user.bio} </Typography>
      </Grid>
      
      
      <Grid container item direction="column" xs={4}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{}}>
              
              { user && <Chip label={`${user.friends.length} Friends`} icon={<GroupIcon />} variant="outlined" />}
              <Chip label={`${user.pacts.length} Pacts`} icon={<GroupIcon />} variant="outlined"/>
            </Stack>
          </CardContent>
          <CardActions>
          </CardActions>
        </Card>
      </Grid>

    </Grid>)
  )
}