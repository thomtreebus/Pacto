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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ForumIcon from '@mui/icons-material/Forum';
import EditIcon from '@mui/icons-material/Edit';
import {useAuth} from "../providers/AuthProvider";

function capitalizeFirstLetter(string) {
  const sanatisedString = string.trim();
  return sanatisedString.charAt(0).toUpperCase() + sanatisedString.slice(1);
}

export default function Profile() {

  const { user: loggedInUser, silentUserRefresh } = useAuth();
  const [displayedUser, setDisplayedUser] = useState(null);
  const { id } = useParams();
  const history = useHistory();
  const [friendStatus, setFriendStatus] = useState(null);
  const [friendRequest, setFriendRequest] = useState(null);
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null)

  const friendEvent = async (status) => {
    const url = (() => {
      switch(status) {
        case 0: return `friends/${friendRequest}/accept`;
        case 1: return `friends/${friendRequest}/reject`;
        case 2: return `friends/remove/${displayedUser._id}`;
        case 3: return `friends/${displayedUser._id}`;
        // no default
      }
    })()

    await fetch(`${process.env.REACT_APP_URL}/${url}`, {
      method: (status === 3) ? "POST" : "PUT",
      credentials: "include",
    })
    silentUserRefresh()
  }

  useEffect( () => {
    const controller = new AbortController();
    if(id){
      fetch(`${process.env.REACT_APP_URL}/users/${id}`, {
        credentials: "include",
        signal: controller.signal,
      }).then((res) => {
        if (!res.ok) {
					throw Error("Could not fetch user profile");
				}
        return res.json()
      }).then((data) => {
        setData(data)
      }).catch((err) => {
        if (err.message === "The user aborted a request.") return;
        if (err.message === "Could not fetch user profile") history.push("/not-found")
      })
    }
    return () => controller.abort();
  },[id, history, loggedInUser])
  useEffect(() => {
    if (displayedUser) {
      var request;
      if ((request = displayedUser.receivedRequests.find((a) => loggedInUser.sentRequests.some((b) => b._id === a)))) {
        setFriendStatus(0);
        setFriendRequest(request);
      } else if ((request = displayedUser.sentRequests.find((a) => loggedInUser.receivedRequests.some((b) => b._id === a)))) {
        setFriendStatus(1);
        setFriendRequest(request);
      } else if (displayedUser.friends.includes(loggedInUser._id)) {
        setFriendStatus(2);
      } else {
        setFriendStatus(3);
      }
    }
  }, [displayedUser, loggedInUser])

  useEffect(() => {
    if (data) {
      if (data.errors.length) {
        history.replace("/not-found");
      }
      setDisplayedUser(data.message);
    }
  }, [data, history]);


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

      <Grid container item direction="column" xs={12}>
        <Box sx={{display : "flex", flexDirection: "column", alignItems: "flex-start"}} alignItems="center" container spacing={2} >
            <Image
              style={{ width: "100px", height: "100px", border: "3px solid #616161", borderRadius: "180px", overflow: "hidden", position: "relative", }}
              alt="Profile Picture"
              cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
              publicID={displayedUser.image}>
            </Image>
            <Stack direction="column" alignItems="left" sx={{}}>
              <Typography variant="h4">{displayedUser.firstName} {displayedUser.lastName}</Typography>
              <Typography variant="subtitle1" sx={{ color: "#1976d2", marginTop: "2px" }}>  {capitalizeFirstLetter(`${displayedUser.course} student at ${displayedUser.university.name}`)} </Typography>
              <Typography variant="subtitle1" sx={{ color: "#616161", }}>  {displayedUser.location} </Typography>
            </Stack>
            <Box sx={{display : "flex", flexDirection: {xs: "column", sm : "row"}, gap: "0.5rem"}}>
              {friendStatus === 0 && <Button variant="outlined" disabled={true} fullwidth="true" startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}}>
                Request Pending...
              </Button>}
              {friendStatus === 1 && <Button variant="contained" color="success" fullwidth="true" startIcon={<EditIcon />} sx={{ marginTop: "2px" }} onClick={() => friendEvent(0)}>
                Accept Friend Request
              </Button>}
              {friendStatus === 1 && <Button variant="contained" color="error" fullwidth="true" startIcon={<EditIcon />} sx={{ marginTop: "2px" }} onClick={() => friendEvent(1)}>
                Reject Friend Request
              </Button>}
              {friendStatus === 2 && <Button variant="contained" color="error" fullwidth="true" startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}} onClick={() => friendEvent(2)}>
                Remove Friend
              </Button>}
              {friendStatus === 3 && <Button variant="outlined" fullwidth="true" startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}} onClick={() => friendEvent(3)}>
                Send Friend Request
              </Button>}
              <Button variant="contained" data-testid="edit-profile-button" disabled={!canEditProfile} fullwidth="true" color="error" onClick={() => history.push("/edit-profile")} startIcon={<EditIcon />} sx={{ marginTop: "2px" }}>
                Edit Profile 
              </Button>
            </Box>              
        </Box>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }}></Divider>
        <Box sx={{flexWrap : "wrap", marginTop: "2px", display: "flex", gap: "1rem"}} alignItems="center"> 
          {displayedUser.instagram && <Chip label={displayedUser.instagram} icon={<InstagramIcon />} variant="outlined" data-testid="instagram-icon" component="a" target="_blank" clickable href={`https://www.instagram.com/${displayedUser.instagram}`} />}
          {displayedUser.linkedin && <Chip label={displayedUser.linkedin} icon={<LinkedInIcon />} data-testid="linkedin-icon" variant="outlined" component="a" target="_blank" clickable href={`https://www.linkedin.com/search/results/all/?keywords=${displayedUser.linkedin}`} />}
          {displayedUser.phone && <Chip label={displayedUser.phone} icon={<WhatsAppIcon />} data-testid="phone-icon" variant="outlined" component="a" target="_blank" clickable href={`tel:${displayedUser.phone}`} />}
          <Chip label={`${displayedUser.friends.length} Friends`} icon={<GroupIcon />} variant="outlined" data-testid="friends-button" onClick={() => history.push("/users")} />
          <Chip label={`${displayedUser.pacts.length} Pacts`} icon={<ForumIcon />} variant="outlined" />
        </Box>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }}></Divider>
        <Typography variant="body1" textAlign={"justify"}> {displayedUser.bio} </Typography>
      </Grid>
    </Grid>)
  )
}