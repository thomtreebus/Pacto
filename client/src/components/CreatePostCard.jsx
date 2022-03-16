import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dropzone from 'react-dropzone'
import PhotoIcon from '@mui/icons-material/Photo';
import TextIcon from '@mui/icons-material/TextSnippet';
import LinkIcon from '@mui/icons-material/Link';
import { useHistory } from "react-router-dom"; 

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

export default function CreatePostCard({pactID}) {
  const [value, setValue] = React.useState(0);
  const history = useHistory();

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

    const response = await fetch(`${process.env.REACT_APP_URL}/pact/${pactID}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: data.get("title"),
        text: data.get("text"),
        image: data.get("image"),
        link: data.get("link"),
        type: getPostType()
      }),
    });

    const json = await response.json();
    console.log(json)

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
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
          <Tab icon={<TextIcon />} label="Post" {...a11yProps(0)} />
          <Tab icon={<PhotoIcon />} label="Image" {...a11yProps(1)} />
          <Tab icon={<LinkIcon />} label="Link"{...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
        >
          <TextField fullWidth name="title" label="Title" />
          <TextField sx={{marginTop: '8px'}}
            id="outlined-multiline-static"
            fullWidth
            label="Text"
            multiline
            name="text"
            rows={4}
            variant="outlined"
          />
          <Button variant="contained" sx={{marginTop: '8px'}} type="submit" fullWidth>Post</Button>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
        >
          <TextField fullWidth name="title" label="Title" />
          {/* <label htmlFor="contained-button-file">
            <Input accept="image/*" id="contained-button-file" multiple type="file" />
            <Button fullWidth variant="contained" component="span" sx={{marginTop: '8px'}}>Upload Photo</Button>
          </label> */}
        <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
          {({getRootProps, getInputProps}) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag and drop or click to upload image</p>
              </div>
            </section>
          )}
        </Dropzone>
        <Button variant="contained" sx={{marginTop: '8px'}} type="submit" fullWidth>Post</Button>
      </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
        >
          <TextField fullWidth name="title" label="Title" />
          <TextField sx={{marginTop: '8px'}}
            id="outlined-multiline-static"
            fullWidth
            label="Link"
            name="link"
            variant="outlined"
          />
          <Button variant="contained" sx={{marginTop: '8px'}} type="submit" fullWidth>Post</Button>
        </Box>
      </TabPanel>
    </Card>
  );
}
