import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import UserList from "../UserList";
import {useEffect, useState} from "react";
import {a11yProps, TabPanel} from "../TabComponents";
import Loading from "../../pages/Loading";
import {useAuth} from "../../providers/AuthProvider";

export default function PactMembersTab({pact}){

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [membersTabValue, setMembersTabValue] = useState(0);
  const [isMod, setIsMod] = useState(false);
  const [allModerators, setAllModerators] = useState(null);
  const [allBannedUsers, setAllBannedUsers] = useState(null);
  const [allPactMembers, setAllPactMembers] = useState(null);

  useEffect(()=>{
    setAllPactMembers(pact.members)
    setAllModerators(pact.moderators)
    setAllBannedUsers(pact.bannedUsers)
    setMembersTabValue(0);
    setIsLoading(false);

    const moderators = pact.moderators.flatMap((user) => user._id);

    if (moderators.includes(user._id)) {
      setIsMod(true);
    } else {
      setIsMod(false);
    }

  }, [pact])

  const handleMembersTabChange = (event, newValue) => {
    setMembersTabValue(newValue);
  };

  if(isLoading){
    return(
      <Loading />
    )
  }

  return (
    <div>
      <Tabs value={membersTabValue} onChange={handleMembersTabChange} aria-label="User type tab">
        <Tab label="All Members" {...a11yProps(0)} />
        <Tab label="Moderators" {...a11yProps(1)} />
        {isMod && <Tab label="Banned Users" {...a11yProps(1)} />}
      </Tabs>
      <TabPanel value={membersTabValue} index={0}>
        <UserList users={allPactMembers}/>
      </TabPanel>
      <TabPanel value={membersTabValue} index={1}>
        <UserList users={allModerators}/>
      </TabPanel>
      {isMod && <TabPanel value={membersTabValue} index={2}>
        <UserList users={allBannedUsers}/>
      </TabPanel>}
    </div>
  )
}