import {Box, Grid, Card, CardHeader, Avatar, Typography, Button} from "@mui/material"
import { useHistory } from "react-router-dom";
import {useAuth} from "../providers/AuthProvider";
import {useEffect, useState} from "react";

export default function UserCardModeration({user, pact, showBannedUsers}){

	const history = useHistory();
  const {user : loggedInUser} = useAuth();
  const [showPromoteButton, setShowPromoteButton] = useState(false);
  const [showDemoteButton, setShowDemoteButton] = useState(false);
  const [showUnBanButton, setShowUnBanButton] = useState(false);
  const [showBanButton, setShowBanButton] = useState(false);
  const [loggedInUserIsMod, setLoggedInUserIsMod] = useState(false);
  const [userCardIsMod, setUserCardIsMod] = useState(false);

    function handleViewButtonClick() {
        history.push(`/user/${user._id}`);
    }


    useEffect(()=>{
      if(loggedInUserIsMod !== undefined) {
        setShowPromoteButton(
          loggedInUserIsMod && user._id !== loggedInUser._id && !userCardIsMod && !showBannedUsers
        );
        setShowDemoteButton(
          loggedInUserIsMod && user._id !== loggedInUser._id && userCardIsMod && !showBannedUsers
        )
        setShowBanButton(
          loggedInUserIsMod && user._id !== loggedInUser._id && !showBannedUsers
        )
        setShowUnBanButton((
          showBannedUsers
        ))

      }
    }, [loggedInUserIsMod])

    useEffect(() => {
      if(pact) {
        const moderators = pact.moderators.flatMap((user) => user._id);
        if (moderators.includes(loggedInUser._id)) {
          setLoggedInUserIsMod(true);
        } else {
          setLoggedInUserIsMod(false);
        }
        if (moderators.includes(user._id)) {
          setUserCardIsMod(true);
        } else {
          setUserCardIsMod(false);
        }
      }
    }, [pact])
    
    return (
        <Box sx={{
            width: '100%',
            padding: "6px",
            }}
        >
            <Grid item xs={12} s={7}>
                <Card onClick={handleViewButtonClick} 
                        data-testid="userCard"
                        sx={{
                            display:"flex",
                            padding: "10px",
                            alignItems: "center",
                            position: "relative",
                            "&:hover": {
                                backgroundColor: "#f5f5f5"
                            }
                        }}
                >
                    <CardHeader
                        avatar={
                          <Avatar
                            src={user.image}
                            alt="user-image"
                            style={{
                              outline: userCardIsMod  ? '3px solid gold' : ''
                            }}
                          />
                        }
                        title={user.name}
                        sx={{ 
                            paddingBlock: 1,
                            padding: "8px",
                            display: "flex",
                            width: "60px", 
                            height: "60px", 
                            overflow: "hidden", 
                            position: "center",
                            borderColor: "inherit",
                        }}                   
                    />   
                    <Typography variant="h7" 
                        sx={{
                            paddingLeft: "25px",
                        }}
                    >{user.firstName} {user.lastName}</Typography>
                  {showPromoteButton && <Button size="small" variant="contained" >Promote</Button>}
                  {showDemoteButton && <Button size="small" color="error" variant="contained" >Demote</Button>}
                  {showBanButton  && <Button size="small" color="error" variant="contained">Ban</Button>}
                  {showUnBanButton && <Button size="small" color="success " variant="contained"> Unban</Button>}
                </Card>
            </Grid>
        </Box>		
	);
}
