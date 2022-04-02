/**
 * A card to provide the ability to create posts of three types
 */

import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PhotoIcon from '@mui/icons-material/Photo';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import TextIcon from '@mui/icons-material/TextSnippet';
import LinkIcon from '@mui/icons-material/Link';
import {styled} from "@mui/material/styles";
import { useHistory } from "react-router-dom";
import { Image } from 'cloudinary-react';
import Axios from 'axios';
import IconButton from '@mui/material/IconButton';
import ErrorMessage from './ErrorMessage';
import {a11yProps, TabPanel} from "./TabComponents";

const Input = styled('input')({
  display: 'none',
});

function TitleTextField({apiPostTitleError}){
  return <TextField fullWidth name="title" label="Title" error={apiPostTitleError.length !== 0} helperText={apiPostTitleError}/> 
}

const POST_TYPES = {
  TEXT: {
    INDEX: 0,
    STRING: "text"
  },
  IMAGE: {
    INDEX: 1,
    STRING: "image"
  },
  LINK: {
    INDEX: 2,
    STRING: "link"
  },
}

/**
 * Used to create posts
 * @param {number} pactID The pact id the post is to be created in
 */
export default function CreatePostCard({pactID}) {
  const [postType, setPostType] = useState(POST_TYPES.TEXT);
  const history = useHistory();

  const [apiPostTitleError, setApiPostTitleError] = useState('');
  const [apiPostTextError, setApiPostTextError] = useState('');
  const [apiPostImageError, setApiPostImageError] = useState(''); // Always displayed in snackbar instead of as field
  const [apiPostLinkError, setApiPostLinkError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [image, setImage] = useState(null);

  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false); // Opens independent error message component.

  const uploadImage = async (newImage) => {
    setIsButtonDisabled(true);

    const data = new FormData();

    data.append("api_key", process.env.REACT_APP_CLOUDINARY_KEY);
    data.append("file", newImage);
    data.append("upload_preset", "n2obmbt1");

    try {
      const res = await Axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, data)
      setImage(res.data.url);
    } catch (err) {
      setApiPostImageError(err.message);
      setOpenErrorSnackbar(true); 
    }

    setIsButtonDisabled(false);
  }

  const handleSubmit = async (event) => {
    setIsButtonDisabled(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget); // Get user-entered data

    setApiPostTitleError('');
    setApiPostTextError('');
    setApiPostImageError('');
    setApiPostLinkError('');

    // Send data to backend
    const response = await fetch(`${process.env.REACT_APP_URL}/pact/${pactID}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: data.get("title"),
        text: data.get("text"),
        image: image,
        link: data.get("link"),
        type: postType.STRING
      }),
    });

    const json = await response.json();
    
    // Handle errors
    Object.values(json['errors']).forEach(err => {
      const field = err["field"];
      const message = err["message"];

      switch(field){
        case "title":
          setApiPostTitleError(message);
          break;
        case "text":
          setApiPostTextError(message);
          break;
        case "image":
          setApiPostImageError(message);
          setOpenErrorSnackbar(true);
          break;
        case "link":
          setApiPostLinkError(message);
          break;
        // no default
      }
    });

    if (response.status !== 201) {
      setIsButtonDisabled(false);
      return;
    }
    history.push(`/pact/${pactID}/post/${json.message._id}`);
    
  };
  
  // Will be executed when new tab is selected
  const handleTabChange = (event, newValue) => {
    const types = Object.values(POST_TYPES); // Get array of possible types
    const newType = types.filter(t => t.INDEX === newValue)[0]; // Get the type with the given index
    setPostType(newType); // Update type
  };

  return (
    <Card sx={{ width: '100%', padding: 1, shadow: 3, marginTop: '18px'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={postType.INDEX} onChange={handleTabChange} aria-label="tabs" centered>
          <Tab icon={<TextIcon />} data-testid="text-icon" label="Text" {...a11yProps(POST_TYPES.TEXT.INDEX)} />
          <Tab icon={<PhotoIcon />} data-testid="image-icon" label="Image" {...a11yProps(POST_TYPES.IMAGE.INDEX)} />
          <Tab icon={<LinkIcon />} data-testid="link-icon" label="Link"{...a11yProps(POST_TYPES.LINK.INDEX)} />
        </Tabs>
      </Box>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
      >
        <TabPanel value={postType.INDEX} index={POST_TYPES.TEXT.INDEX}>
          <TitleTextField apiPostTitleError={apiPostTitleError}/>
          <TextField sx={{marginTop: '8px'}}
            id="text"
            fullWidth
            label="Text"
            data-testid="post-text-field"
            multiline
            name="text"
            rows={4}
            variant="outlined"
            error={apiPostTextError.length !== 0}
            helperText={apiPostTextError}
          />
        </TabPanel>
        <TabPanel value={postType.INDEX} index={POST_TYPES.IMAGE.INDEX}>
          <TitleTextField apiPostTitleError={apiPostTitleError}/> 
          <label htmlFor="contained-button-file">
            <Input
              accept="image/*"
              id="contained-button-file"
              data-testid="image-upload-icon"
              type="file"
              onChange={(e) => { uploadImage(e.target.files[0])}} 
              disabled={isButtonDisabled}
            />
            <IconButton color="primary" component="span" disabled={isButtonDisabled}>
              <PhotoCameraIcon />
            </IconButton>
            {image && <Image
								style={{width: "100%", minWidth: "50%", minHeight: "25%", borderRadius: "10px", overflow: "hidden", position: "relative", }}
								alt="Profile Picture"
								cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
								publicID={image}
							> </Image>}
          </label>
          <ErrorMessage  isOpen={openErrorSnackbar} setIsOpen={setOpenErrorSnackbar} message={apiPostImageError}/>
        </TabPanel>
        <TabPanel value={postType.INDEX} index={POST_TYPES.LINK.INDEX}>
          <TitleTextField apiPostTitleError={apiPostTitleError}/> 
          <TextField sx={{marginTop: '8px'}}
            id="link"
            fullWidth
            label="Link"
            data-testid="link-input"
            name="link"
            variant="outlined"
            error={apiPostLinkError.length !== 0} 
            helperText={apiPostLinkError}
          />
        </TabPanel>
        <Button variant="contained" sx={{marginTop: '8px'}} type="submit" fullWidth disabled={isButtonDisabled}>Post</Button>
      </Box>
    </Card>
  );
}