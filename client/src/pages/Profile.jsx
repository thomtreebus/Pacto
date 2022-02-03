import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Photo from '../assets/KC.jpeg';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import LocationIcon from '@mui/icons-material/LocationOn';
import CourseIcon from '@mui/icons-material/School';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Divider } from '@mui/material';

export default function Profile() {

  const { user, setUser, setIsAuthenticated, IsAuthenticated } = useAuth();
  
  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   const data = new FormData(event.currentTarget);

  //   await fetch(`${process.env.REACT_APP_URL}/${user.id}`)
  // }


  return (
    <Grid container p={4} spacing={2} justify="center" justifyContent="center" alignItems="stretch">
      <Grid item direction="column" xs={4}>
        <Avatar
          src={Photo}
          variant="rounded"
          sx={{ width: "250px", height: "250px" }} />
        <TextField
          name="location"
          label="Location"
          variant="outlined"
          defaultValue={user.location}
          size="small"
          InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationIcon />
            </InputAdornment>
          ),
          }}
          sx={{
            marginTop: 2
          }}
        />
        <TextField
          name="course"
          label="Course"
          variant="outlined"
          size="small"
          defaultValue={user.course}
          InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CourseIcon />
            </InputAdornment>
          ),
          }}
          sx={{
            marginTop: 1
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            marginTop: 1, marginLeft: 0, color: "#6d7175"
          }}>
          {user.friends.length} Friends
        </Typography>
        <Divider sx={{ marginTop: 1, width: "97%" }} />
        <TextField
          name="linkedin"
          variant="outlined"
          size="small"
          defaultValue={user.linkedin}
          InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LinkedInIcon />
            </InputAdornment>
          ),
          }}
          sx={{
            marginTop: 1
          }}
        />
        <TextField
          name="instagram"
          variant="outlined"
          size="small"
          defaultValue={user.instagram}
          InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <InstagramIcon />
            </InputAdornment>
          ),
          }}
          sx={{
            marginTop: 1
          }}
        />
        <TextField
          name="instagram"
          variant="outlined"
          size="small"
          defaultValue={user.instagram}
          InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <WhatsAppIcon />
            </InputAdornment>
          ),
          }}
          sx={{
            marginTop: 1
          }}
        />
        
      </Grid>
      <Grid item direction="column" xs={8}>
        <Typography variant="h4">{user.firstName} {user.lastName}</Typography>
        {/* <Typography variant="subtitle1"> {user.university} </Typography> */}
        <Typography variant="subtitle1" sx={{ color: "#1976d2" }}> King's College London </Typography>
        <TextField
          name="bio"
          label="Bio"
          multiline
          rows={6}
          defaultValue={user.bio}
          sx={{
            marginTop: 2,
            width: "100%"
          }}
        />
        <Button
          sx={{float: "right", marginTop: 30}}
          variant="contained"
          // type="submit"
        >
          
          
          Update Profile
        </Button>
      </Grid>
    </Grid>
  );
    
}
