/**
 * Capitalises the first letter of a string
 */

import React from 'react';
import { useState } from "react";
import { Image } from 'cloudinary-react';
import { useHistory } from "react-router-dom";
import Grid from '@mui/material/Grid';
import {useParams } from "react-router-dom";
import Loading from "./Loading";
import { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button"
import Box from '@mui/material/Box';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupIcon from '@mui/icons-material/Group';
import ForumIcon from '@mui/icons-material/Forum';
import EditIcon from '@mui/icons-material/Edit';
import {useAuth} from "../providers/AuthProvider";
import FriendButtons from '../components/FriendButtons';

/**
 * Capitalises the first letter of a string
 * @param {string} string 
 */
function capitalizeFirstLetter(string) {
  const sanitisedString = string.trim();
  return sanitisedString.charAt(0).toUpperCase() + sanitisedString.slice(1);
}

/**
 * Page that displays the profile of a user
 */
export default function Profile() {
  const { user: loggedInUser, silentUserRefresh } = useAuth();
  const [displayedUser, setDisplayedUser] = useState(null);
  const { id } = useParams();
  const history = useHistory();
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    silentUserRefresh();
    const controller = new AbortController();
    fetch(`${process.env.REACT_APP_URL}/users/${id}`, {
      credentials: "include",
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch user profile");
      }
      return res.json()
    }).then((data) => {
      setDisplayedUser(data.message)
    }).catch((err) => {
      if (err.name === "AbortError") return;
      if (err.message === "Could not fetch user profile") history.push("/not-found")
    });
    return () => controller.abort();
  }, [id, history, silentUserRefresh])

  useEffect(() => {
    if(displayedUser) {
      if (loggedInUser._id === displayedUser._id) {
        setCanEditProfile(true);
      } else {
        setCanEditProfile(false);
      }
      setIsLoading(false);
    }
  }, [displayedUser, loggedInUser]);
  
  if (isLoading) {
    return <Loading />;
  }

  return (
    displayedUser && (
    <Grid
      container
      p={4}
      spacing={2}
      justify="center"
      justifyContent="center"
      alignItems="stretch"
      maxWidth="60rem"
    >

      <Grid container item sx={{flex: 1, flexWrap: "wrap", wordBreak:"break-word", overflow: "hidden"}} direction="column" xs={12}>
        <Box sx={{display : "flex", flexDirection: "column", alignItems: "flex-start"}} alignItems="center" container spacing={2} >
            <Image
              style={{ width: "100px", height: "100px", border: "3px solid #616161", borderRadius: "180px", overflow: "hidden", position: "relative", }}
              alt="Profile Picture"
              cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
              publicID={displayedUser.image}>
            </Image>
            <Stack direction="column" alignItems="left" sx={{}}>
              <Typography variant="h4">{displayedUser.firstName} {displayedUser.lastName}</Typography>
              <Typography variant="subtitle1" sx={{ color: "#1976d2", marginTop: "2px" }}>  {capitalizeFirstLetter(`${displayedUser.course||""} student at ${displayedUser.university.name}`)} </Typography>
              <Typography variant="subtitle1" sx={{ color: "#616161", }}>  {displayedUser.location} </Typography>
            </Stack>
            <Box sx={{
            width: '100%',
            padding: "0px",
            }}
            >
              <FriendButtons currentUser={loggedInUser} user={displayedUser}/>     
              { canEditProfile && 
                <Button variant="contained" data-testid="edit-profile-button" fullwidth="true" color="error" onClick={() => history.push("/edit-profile")} startIcon={<EditIcon />} sx={{ marginTop: "2px" }}>
                  Edit Profile 
                </Button>   
              }
            </Box>
        </Box>
        <Divider sx={{marginTop: "10px", marginBottom: "10px"}}/>
        <Box sx={{flexWrap : "wrap", marginTop: "2px", display: "flex", gap: "1rem"}} alignItems="center"> 
          {displayedUser.instagram && <Chip label={displayedUser.instagram} icon={<InstagramIcon />} variant="outlined" data-testid="instagram-icon" component="a" target="_blank" clickable href={`https://www.instagram.com/${displayedUser.instagram}`} />}
          {displayedUser.linkedin && <Chip label={displayedUser.linkedin} icon={<LinkedInIcon />} data-testid="linkedin-icon" variant="outlined" component="a" target="_blank" clickable href={`https://www.linkedin.com/search/results/all/?keywords=${displayedUser.linkedin}`} />}
          {displayedUser.phone && <Chip label={displayedUser.phone} icon={<WhatsAppIcon />} data-testid="phone-icon" variant="outlined" component="a" target="_blank" clickable href={`tel:${displayedUser.phone}`} />}
          <Chip label={`${displayedUser.friends.length} Friends`} icon={<GroupIcon />} variant="outlined" data-testid="friends-button" onClick={() => history.push("/users")} />
          <Chip label={`${displayedUser.pacts.length} Pacts`} icon={<ForumIcon />} variant="outlined" />
        </Box>
        <Divider sx={{marginTop: "10px", marginBottom: "10px"}}/>
        <Typography variant="body1" textAlign={"justify"}  multiline="true" style={{whiteSpace: 'pre-line'}}> {displayedUser.bio} </Typography>
      </Grid>
    </Grid>)
  )
}