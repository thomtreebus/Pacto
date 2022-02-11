import React from 'react';
import Axios from 'axios';
import { useHistory } from "react-router-dom";
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


const Input = styled('input')({
  display: 'none',
});

export default function EditProfile() {

  const { user } = useAuth();
  const history = useHistory();

  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [course, setCourse] = useState(user.course);
  const [linkedin, setLinkedin] = useState(user.linkedin);
  const [instagram, setInstagram] = useState(user.instagram);
  const [phone, setPhone] = useState(user.phone);
  const [image, setImage] = useState(user.image);
  const [imageToUpload, setUploadImage] = useState(user.image);

  const uploadImage = () => {
    console.log(image);
    const data = new FormData();

    data.append("api_key", process.env.REACT_APP_CLOUDINARY_KEY);
    data.append("file", imageToUpload);
    data.append("upload_preset", "n2obmbt1");

    Axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, data)
      .then((res) => {
        console.log(res)
        console.log(res.data.secure_url);
        setImage(res.data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = { bio, location, course, linkedin, instagram, phone, image }

    await fetch(`${process.env.REACT_APP_URL}/users/${user._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data)
    }).then(() => {
      console.log("Data ", JSON.stringify(data));
      history.push('/profile');
    });
  
  }


  return (
    <Grid
      component="form"
      noValidate
      onSubmit={handleSubmit}
      container
      p={4}
      spacing={2}
      justify="center"
      justifyContent="center"
      alignItems="stretch">
      <Grid item direction="column" xs={4}>
        <Image
          style={{width: "100%", minWidth: "50%", minHeight: "25%", borderRadius: "10px", overflow: "hidden", position: "relative", }}
          cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
          publicID={image}
        >
        </Image>
        <Stack direction="row" alignItems="center" spacing={2}>
          <label htmlFor="contained-button-file">
            <Input
              accept="image/*"
              id="contained-button-file"
              type="file"
              onChange={(e) => { setUploadImage(e.target.files[0]) }} />
            <IconButton color="primary" component="span">
              <PhotoIcon />
            </IconButton>
          </label>
          <Button
              fullWidth
              variant="contained"
              component="span"
              onClick={uploadImage}
              sx={{
                marginTop: 1
              }}
              >
              Upload Image
            </Button>
          </Stack>
        

        <TextField
          name="location"
          label="Location"
          variant="outlined"
          fullWidth
          defaultValue={user.location}
          onChange={(e) => {
            setLocation(e.target.value)
          }}
          size="small"
          InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationIcon />
            </InputAdornment>
          ),
          }}
          sx={{
            marginTop: 1
          }}
        />
        <TextField
          name="course"
          label="Course"
          variant="outlined"
          size="small"
          fullWidth
          defaultValue={user.course}
          onChange={(e) => setCourse(e.target.value)}
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
          fullWidth
          defaultValue={user.linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
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
          fullWidth
          defaultValue={user.instagram}
          onChange={(e) => setInstagram(e.target.value)}
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
          name="phone"
          variant="outlined"
          size="small"
          fullWidth
          defaultValue={user.phone}
          onChange={(e) => setPhone(e.target.value)}
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
        <Typography variant="subtitle1" sx={{ color: "#1976d2" }}> King's College London </Typography>
        <TextField
          name="bio"
          label="Bio"
          multiline
          rows={6}
          defaultValue={user.bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{
            marginTop: 2,
            width: "100%"
          }}
        />
        <Button
          sx={{float: "right", marginTop: 30}}
          variant="contained"
          type="submit"
        >
          Update Profile
        </Button>
      </Grid>
    </Grid>
  );
    
}
