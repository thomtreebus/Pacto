import {Box, Typography} from "@mui/material";
import Tab from "@mui/material/Tab";
import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {useAuth} from '../providers/AuthProvider';
import Loading from "./Loading";
import UserList from "../components/UserList";
import Tabs from "@mui/material/Tabs";
import PropTypes from "prop-types";
import Container from "@mui/material/Container";


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
          <Typography component={'div'}>{children}</Typography>
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
    const [allSameLocation, setAllSameLocation] = useState(null);
    const [allSameCourse, setAllSameCourse] = useState(null);
    const history = useHistory();
    const [value, setValue] = useState(0);

    useEffect(() => {
      const controller = new AbortController();
      fetch(`${process.env.REACT_APP_URL}/users`, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      }).then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch users");
        }
        return res.json();
      }).then((data) => {
        const resAllUsers = data.message
        setAllFriends(
          resAllUsers.filter(curUser => curUser.friends.includes(user._id))
        );
        setAllSameCourse(
          user.course?.trim() ? resAllUsers.filter(curUser => curUser.course === user.course) : [user]
        );
        setAllSameLocation(
          user.location?.trim() ? resAllUsers.filter(curUser => curUser.location === user.location) : [user]
        );
        setAllUsers(resAllUsers);
        setIsLoading(false);
      }).catch((err) => {
        if (err.message === "The user aborted a request.") return;
        history.push("/not-found");
    })
    return () => controller.abort();
    }, [history, user])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if(isLoading){
    return (
      <Loading/>
    )
  }
	
	return (
    <Container fixed>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="User type tab">
            <Tab label="Same University" {...a11yProps(0)} />
            <Tab label="Friends" {...a11yProps(1)} />
            <Tab label="Same Course" sx={{display : {xs: "none", md: "block"}}} {...a11yProps(2)} />
            <Tab label="Same Location"  sx={{display : {xs: "none", md: "block"}}}  {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <UserList users={allUsers}/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <UserList users={allFriends}/>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <UserList users={allSameCourse}/>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <UserList users={allSameLocation}/>
        </TabPanel>
      </Box>
    </Container>
    // <UserPortfolio user = {user}></UserPortfolio>
    )
}
