/**
 * Displays a list of users with certain conditions, such as same course, friends etc.
 */

import {Box} from "@mui/material";
import Tab from "@mui/material/Tab";
import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {useAuth} from '../providers/AuthProvider';
import Loading from "./Loading";
import UserList from "../components/UserList";
import Tabs from "@mui/material/Tabs";
import Container from "@mui/material/Container";
import {a11yProps, TabPanel} from "../components/TabComponents";

export default function UserPage() {

    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [allUsers, setAllUsers] = useState(null);
    const [allFriends, setAllFriends] = useState(null);
    const [allSameCourse, setAllSameCourse] = useState(null);
    const [sentRequests, setSentRequests] = useState(null);
    const [receivedRequests, setReceivedRequests] = useState(null);
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
        setSentRequests(
          user.sentRequests && resAllUsers.filter(u => user.sentRequests.some(r => r.recipient===u._id))
        );
        setReceivedRequests(
          user.receivedRequests && resAllUsers.filter(u => user.receivedRequests.some(r => r.requestor===u._id))
        );
        setAllUsers(resAllUsers);
        setIsLoading(false);
      }).catch((err) => {
        if (err.name === "AbortError") return;
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
            <Tab label="All" sx={{ justifyContent: "start" }} {...a11yProps(0)} />
            <Tab label="Friends" sx={{ justifyContent: "start" }} {...a11yProps(1)} />
            <Tab label="Same Course" sx={{display : {xs: "none", md: "block"}}} {...a11yProps(2)} />
            <Tab label="Received Requests"  sx={{display : {xs: "none", md: "block"}}}  {...a11yProps(3)} />
            <Tab label="Sent Requests"  sx={{display : {xs: "none", md: "block"}}}  {...a11yProps(4)} />
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
          <UserList users={receivedRequests}/>
        </TabPanel>
        <TabPanel value={value} index={4}>
          <UserList users={sentRequests}/>
        </TabPanel>
      </Box>
    </Container>
  )
}
