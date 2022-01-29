import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import PhotoIcon from '@mui/icons-material/Photo';
import TextIcon from '@mui/icons-material/TextSnippet';
import LinkIcon from '@mui/icons-material/Link';


const Input = styled('input')({
  display: 'none',
});


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
    <Card sx={{ width: '40%', padding: '100', marginTop: '18px'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
          {/* <Tab icon={<TextIcon />} label="Post" {...a11yProps(0)} /> */}
          {/* <Tab icon={<PhotoIcon />} label="Image" {...a11yProps(1)} />
          <Tab icon={<LinkIcon />} label="Link"{...a11yProps(2)} /> */}
          <Tab label={<div><TextIcon style={{ verticalAlign: 'middle' }} /> Post </div>} {...a11yProps(0)} />
          <Tab label={<div><PhotoIcon style={{ verticalAlign: 'middle' }} /> Image </div>} {...a11yProps(0)} />
          <Tab label= {<div><LinkIcon style = { {verticalAlign : 'middle'} } /> Link </div>} {...a11yProps(0)} />
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
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField fullWidth label="Title" />
          <label htmlFor="icon-button-file">
            <Input accept="image/*" id="icon-button-file" type="file" />
            <IconButton color="primary" aria-label="upload picture" component="span">
              <CameraIcon />
            </IconButton>
          </label>
        </Stack>

        <Button variant="contained" sx={{marginTop: '8px'}}>Post</Button>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <TextField fullWidth label="Title" />
        <TextField fullWidth label="URL" sx={{marginTop: '8px'}}/>
        <Button variant="contained" sx={{marginTop: '8px'}}>Post</Button>
      </TabPanel>
    </Card>
  );
}
