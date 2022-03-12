
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
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ForumIcon from '@mui/icons-material/Forum';
import EditIcon from '@mui/icons-material/Edit';
import {useAuth} from "../providers/AuthProvider";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Profile() {

  const { user: loggedInUser } = useAuth();
  const [displayedUser, setDisplayedUser] = useState(null);
  const { id } = useParams();
  const history = useHistory();
  const [value, setValue] = useState(0);
  const [canFriend, setCanFriend] = useState(false);
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null)

  useEffect( () => {
    if(id){
      async function fetchData(){
        return fetch(`${process.env.REACT_APP_URL}/users/${id}`, {
          credentials: "include",
        }).then((res) => res.json())
      }
      fetchData().then((data) => setData(data))
    }
  },[id])

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
        setCanFriend(true);
      }
      setIsLoading(false);
    }
  }, [displayedUser, loggedInUser]);


  

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  if (isLoading) {
    return <Loading />;
  }

  return (
     displayedUser && (<Grid
      container
      p={4}
      spacing={2}
      justify="center"
      justifyContent="center"
      alignItems="stretch"
    >
      <Grid container item direction="column" xs={8}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{}}>
          <Image
            style={{ width: "100px", height: "100px", border: "3px solid #616161", borderRadius: "180px", overflow: "hidden", position: "relative", }}
            alt="Profile Picture"
            cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
            publicID={displayedUser.image}>
          </Image>
          <Stack direction="column" alignItems="left" sx={{}}>
            <Typography variant="h4">{displayedUser.firstName} {displayedUser.lastName}</Typography>
            <Typography variant="subtitle1" sx={{ color: "#1976d2", marginTop: "2px" }}>  {displayedUser.course} student at {displayedUser.university.name} </Typography>
            <Typography variant="subtitle1" sx={{ color: "#616161", }}>  {displayedUser.location} </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }}></Divider>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ marginTop: "2px" }}>
          <Chip label={`${displayedUser.instagram||""}`} icon={<InstagramIcon />} variant="outlined" data-testid="instagram-icon" component="a" target="_blank" clickable href={`https://www.instagram.com/`} />
          <Chip label={`${displayedUser.linkedin||""}`} icon={<LinkedInIcon />} data-testid="linkedin-icon" variant="outlined" component="a" target="_blank" clickable href={`https://www.linkedin.com/`} />
          <Chip label={`${displayedUser.phone||""}`} icon={<WhatsAppIcon />} data-testid="phone-icon" variant="outlined" />
        </Stack>
        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }}></Divider>
        <Typography variant="body1" sx={{}}> {displayedUser.bio} </Typography>
        {/* <Divider sx={{ marginTop: "10px" }}></Divider> */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Posts" {...a11yProps(0)} />
              <Tab label="Comments" {...a11yProps(1)} />
              <Tab label="Pacts" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            Posts
          </TabPanel>
          <TabPanel value={value} index={1}>
            Comments
          </TabPanel>
          <TabPanel value={value} index={2}>
            Pacts
          </TabPanel>
        </Box>
      </Grid>
      
      <Grid container item direction="column" xs={4}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} fullwidth="true" justifyContent="center">
              <Chip label={`${displayedUser.friends.length} Friends`} icon={<GroupIcon />} variant="outlined" />
              <Chip label={`${displayedUser.pacts.length} Pacts`} icon={<ForumIcon />} variant="outlined" />
            </Stack>
            <Button variant="outlined" fullwidth="true" disabled={!canFriend} startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}}>Send Friend Request</Button>
            {<Button variant="contained" data-testid="edit-profile-button" disabled={!canEditProfile} fullwidth="true" color="error" onClick={() => history.push("/edit-profile")} startIcon={<EditIcon />} sx={{ marginTop: "2px" }}>
              Edit Profile </Button>
              }
          </CardContent>
          <CardActions>
          </CardActions>
        </Card>
      </Grid>

    </Grid>)
  )
}