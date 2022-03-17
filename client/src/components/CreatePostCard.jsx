import * as React from 'react';
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
import { useHistory } from "react-router-dom";
import Input from "@mui/material/Input";
import { Image } from 'cloudinary-react';
import Axios from 'axios';
import IconButton from '@mui/material/IconButton';

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

  const [image, setImage] = React.useState(null);

  const uploadImage = async (newImage) => {
    const data = new FormData();

    data.append("api_key", process.env.REACT_APP_CLOUDINARY_KEY);
    data.append("file", newImage);
    data.append("upload_preset", "n2obmbt1");

    try {
      const res = await Axios.post(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, data)
      setImage(res.data.url);
    } catch (err) {
      console.log(err);
    }
  }

  function getPostType() {
    switch(value) {
      case 0:
        return "text"
      case 1:
        return "image";
      case 2:
        return "link";
      default:
        return"undefined";
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setApiPostTitleError('');

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

      switch (field) {
        case "title":
          setApiPostTitleError(message);
          break;
        case "link":
          break;
        default:
          break;
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
          <Tab icon={<PhotoIcon />} label="Image" {...a11yProps(1)} />
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
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TitleTextField apiPostTitleError={apiPostTitleError}/> 
          <label data-testid="image-upload-icon" htmlFor="contained-button-file">
            <Input
              accept="image/*"
              id="contained-button-file"
              type="file"
              sx={{display: "none"}}
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
          />
        </TabPanel>
        <Button variant="contained" sx={{marginTop: '8px'}} type="submit" fullWidth>Post</Button>
      </Box>
    </Card>
  );
}
