// import React from 'react';
// import Card from '@mui/material/Card';
// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';
// // import TabPanel from '@mui/lab/TabPanel';
// // import TabContext from '@mui/lab/TabContext';
// import PhoneIcon from '@mui/icons-material/Phone';
// import CameraIcon from '@mui/icons-material/CameraAlt';
// import PhotoIcon from '@mui/icons-material/Photo';
// import TextIcon from '@mui/icons-material/TextSnippet';
// import LinkIcon from '@mui/icons-material/Link';

// import PropTypes from 'prop-types';
// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';
// import Typography from '@mui/material/Typography';
// import Box from '@mui/material/Box';

// export default function CreatePost() {

//   const [value, setValue] = React.useState(0);

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   return (
//     <Card variant="outlined">
//       <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example">
//         <Tab icon={<TextIcon />} label="Text" value="1"/>
//         <Tab icon={<PhotoIcon />} label="Image" value="2"/>
//         <Tab icon={<LinkIcon />} label="Link" value="3"/>
//       </Tabs>
//     </Card>

//         <Box sx={{ width: '100%' }}>
//       <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//         <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
//           <Tab label="Item One" {...a11yProps(0)} />
//           <Tab label="Item Two" {...a11yProps(1)} />
//           <Tab label="Item Three" {...a11yProps(2)} />
//         </Tabs>
//       </Box>
//       <TabPanel value={value} index={0}>
//         Item One
//       </TabPanel>
//       <TabPanel value={value} index={1}>
//         Item Two
//       </TabPanel>
//       <TabPanel value={value} index={2}>
//         Item Three
//       </TabPanel>
//     </Box>
//   );
// }
