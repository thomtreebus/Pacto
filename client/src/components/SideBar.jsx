import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Avatar from '@mui/material/Avatar';
import PactoIcon from '../assets/pacto-logo.ico';
import FeedIcon from '@mui/icons-material/Feed';
import PactIcon from '@mui/icons-material/Forum';
import FriendsIcon from '@mui/icons-material/People';
import UniversityIcon from '@mui/icons-material/School';
import { deepOrange, deepPurple } from '@mui/material/colors';
import { ListItemButton } from '@mui/material';

const drawerWidth = 240;

export default function SideBar() {

  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
      <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem>
            <ListItemIcon><Avatar alt="Placeholder" src={PactoIcon} /></ListItemIcon>
            <ListItemText primary="User Name" />
          </ListItem>
            <ListItem button key="Feed"
              selected={selectedIndex === 0}
              onClick={(event) => handleListItemClick(event, 0)} >
            <ListItemIcon><FeedIcon /></ListItemIcon>
            <ListItemText primary="Feed" />
          </ListItem>
            <ListItem button key="University Hub"
              selected={selectedIndex === 1}
              onClick={(event) => handleListItemClick(event, 1)}>
            <ListItemIcon><UniversityIcon /></ListItemIcon>
            <ListItemText primary="University Hub" />
          </ListItem>
            <ListItem button key="Pacts"
              selected={selectedIndex === 2}
              onClick={(event) => handleListItemClick(event, 2)}>
            <ListItemIcon><PactIcon /></ListItemIcon>
            <ListItemText primary="Pacts" />
          </ListItem>
            <ListItem button key="Friends"
              selected={selectedIndex === 3}
              onClick={(event) => handleListItemClick(event, 3)}>
            <ListItemIcon><FriendsIcon /></ListItemIcon>
            <ListItemText primary="Friends" />
          </ListItem>
        </List>
        <Divider />
        <List>
        {['Pact1', 'Pact2', 'Pact3'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {/* {index % 2 === 0 ? <InboxIcon /> : <MailIcon />} */}
              <Avatar sx={{ bgcolor: deepPurple[500] }}>{ text.substring(0,2).toUpperCase() }</Avatar>
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
        </List>
        </Box>
      </Drawer>
    </Box>
  );
}

