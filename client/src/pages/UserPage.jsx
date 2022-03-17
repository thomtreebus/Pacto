import { Box, Typography, Card, Fab } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import React, { useState } from "react";
import background from "../assets/hub-background.jpg";
import { Divider } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useHistory } from "react-router-dom";
import PactGrid from "../components/PactGrid";
import { useQuery } from "react-query";
import { useAuth } from '../providers/AuthProvider';
import Loading from "./Loading";
import { useEffect } from "react";
import UserPortfolio from "../components/TabComponent/UserPortfolio";
import UserCard from "../components/UserCard";
import UserList from "../components/UserList";
import Tabs from "@mui/material/Tabs";
import MyPactList from "../components/MyPactList";
import PropTypes from "prop-types";



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

export default function UserPage() {

    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [allUsers, setAllUsers] = useState(null);
    const [allFriends, setAllFriends] = useState(null);
    const history = useHistory();
    const [value, setValue] = useState(0);

    useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/users`, {
      method: "GET",
      credentials: "include"
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch pact");
      }
      return res.json();
    }).then((data) => {
      const resAllUsers = data.message
      setAllUsers(resAllUsers);
      let myFriends = [];
      for (let x = 0; x< resAllUsers; x++){
        if(resAllUsers[x].friends.includes(user._id)){
          myFriends.push(resAllUsers[x]);
        }
      }
      console.log(myFriends);
      setAllFriends(myFriends);
      setIsLoading(false);
    }).catch(() => {
      history.push("/not-found");
    })
  }, [])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if(isLoading){
    return (
      <Loading/>
    )
  }
	
	return (

    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="All university users" {...a11yProps(0)} />
          <Tab label="Friends" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <UserList users={allUsers}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <UserList users={allFriends}/>
      </TabPanel>
    </Box>
            //<UserPortfolio user = {user}></UserPortfolio>
    )
}
