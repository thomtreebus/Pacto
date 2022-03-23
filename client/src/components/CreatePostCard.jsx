import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
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

const Input = styled('input')({
  display: 'none',
});

function TitleTextField({apiPostTitleError}){
  return <TextField fullWidth name="title" label="Title" error={apiPostTitleError.length !== 0} helperText={apiPostTitleError}/> 
}

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
          <Typography component={'span'}>{children}</Typography>
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

export default function CreatePostCard({pactID}) {
  const [value, setValue] = React.useState(0);
  const history = useHistory();

  const [apiPostTitleError, setApiPostTitleError] = React.useState('');
  const [apiPostTextError, setApiPostTextError] = React.useState('');
  const [apiPostImageError, setApiPostImageError] = React.useState('');
  const [apiPostLinkError, setApiPostLinkError] = React.useState('');

  const [image, setImage] = React.useState(null);

  const [open, setOpen] = React.useState(false);

  const uploadImage = async (newImage) => {
    const data = new FormData();

    data.append("api_key", process.env.REACT_APP_CLOUDINARY_KEY);
    data.append("file", newImage);
    data.append("upload_preset", "n2obmbt1");

    try {
      const res = await Axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, data)
      setImage(res.data.url);
    } catch (err) {
      setApiPostImageError(err.message);
      setOpen(true);
    }
  }

  function getPostType() {
    switch(value) {
      case 1:
        return "image";
      case 2:
        return "link";
      default:
        return "text";
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setApiPostTitleError('');
    setApiPostTextError('');
    setApiPostImageError('');
    setApiPostLinkError('');

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
        type: getPostType()
      }),
    });

    const json = await response.json();
    
    Object.values(json['errors']).forEach(err => {
      const field = err["field"];
      const message = err["message"];

      if (field === "title") {
        setApiPostTitleError(message);
      }

      if (getPostType() === "text") {
        switch (field) {
          case ("text"): 
            setApiPostTextError(message);
            break;
          default: // do nothing
        }
      }
      else if (getPostType() === "image") {
        switch (field) {
          case ("image"): 
            setApiPostImageError(message);
            setOpen(true);
            break;
          default: // do nothing
        }
      } else {
        switch (field) {
          case ("link"): 
            setApiPostLinkError(message);
            break;
          default: // do nothing
        }
      }
    })

    if (response.status !== 201) {
      return;
    }
    history.push(`/pact/${pactID}/post/${json.message._id}`);
    
  };
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Card sx={{ width: '100%', padding: '100', marginTop: '18px'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="tabs" centered>
          <Tab icon={<TextIcon />} label="Post" {...a11yProps(0)} />
          <Tab icon={<PhotoIcon />} data-testid="image-icon" label="Image" {...a11yProps(1)} />
          <Tab icon={<LinkIcon />} data-testid="link-icon" label="Link"{...a11yProps(2)} />
        </Tabs>
      </Box>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
      >
        <TabPanel value={value} index={0}>
          <TitleTextField apiPostTitleError={apiPostTitleError}/>
          <TextField sx={{marginTop: '8px'}}
            id="text"
            fullWidth
            label="Text"
            multiline
            name="text"
            rows={4}
            variant="outlined"
            error={apiPostTextError.length !== 0}
            helperText={apiPostTextError}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TitleTextField apiPostTitleError={apiPostTitleError}/> 
          <label htmlFor="contained-button-file">
            <Input
              accept="image/*"
              id="contained-button-file"
              data-testid="image-upload-icon"
              type="file"
              onChange={(e) => { uploadImage(e.target.files[0])}} />
            <IconButton color="primary" component="span">
              <PhotoCameraIcon />
            </IconButton>
            {image && <Image
								style={{width: "100%", minWidth: "50%", minHeight: "25%", borderRadius: "10px", overflow: "hidden", position: "relative", }}
								alt="Profile Picture"
								cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
								publicID={image}
							> </Image>}
          </label>
          <ErrorMessage  isOpen={open} setIsOpen={setOpen} message={apiPostImageError}/>
        </TabPanel>
        <TabPanel value={value} index={2}>
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
        <Button variant="contained" sx={{marginTop: '8px'}} type="submit" fullWidth>Post</Button>
      </Box>
    </Card>
  );
}
