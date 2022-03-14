import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
// import { styled } from '@mui/material/styles'; 
import Button from '@mui/material/Button';
import Dropzone from 'react-dropzone'
import PhotoIcon from '@mui/icons-material/Photo';
import TextIcon from '@mui/icons-material/TextSnippet';
import LinkIcon from '@mui/icons-material/Link';


// const Input = styled('input')({
//   display: 'none',
// });


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

export default function CreatePostCard() {
  const [value, setValue] = React.useState(0);
  
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
        <TextField fullWidth label="Title" />
        <TextField sx={{marginTop: '8px'}}
          id="outlined-multiline-static"
          fullWidth
          label="Text"
          multiline
          rows={4}
          variant="outlined"
        />
        <Button variant="contained" sx={{marginTop: '8px'}}>Post</Button>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TextField fullWidth label="Title" />
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
        <Button variant="contained" sx={{marginTop: '8px'}}>Post</Button>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <TextField fullWidth label="Title" />
        <Button variant="contained" sx={{marginTop: '8px'}}>Post</Button>
      </TabPanel>
    </Card>
  );
}
