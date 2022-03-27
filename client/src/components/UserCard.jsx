import { Box, Grid, Card, CardHeader, Avatar, Typography, Button } from "@mui/material"
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';

export default function UserCard({user}){

    const {user: currentUser} = useAuth();

    const [isFriend, setIsFriend] = useState(currentUser.friends && currentUser.friends.includes(user._id));
    const [hasSentRequest, setHasSentRequest] = useState(currentUser.sentRequests && currentUser.sentRequests.some(r => r.recipient === user._id));
    const [hasReceivedRequest, setHasReceivedRequest] = useState(currentUser.receivedRequests && currentUser.receivedRequests.some(r => r.requestor === user._id));
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

	const history = useHistory();

    function handleViewButtonClick() {
        history.push(`/user/${user._id}`);
    }

    function sendFriendRequest() {
        setButtonsDisabled(true);

        fetch(`${process.env.REACT_APP_URL}/friends/${user._id}`, {
            method: "POST",
            credentials: "include",
        });

        setHasSentRequest(true);

        setButtonsDisabled(false);
    }

    function acceptFriend(){
        setButtonsDisabled(true);

        const friendRequestId = currentUser.receivedRequests.filter(r => r.requestor===user._id)[0]._id;

        fetch(`${process.env.REACT_APP_URL}/friends/${friendRequestId}/accept`, {
            method: "PUT",
            credentials: "include",
        });

        setHasReceivedRequest(false);
        setIsFriend(true);

        setButtonsDisabled(false);
    }

    function declineFriend(){
        setButtonsDisabled(true);

        const friendRequestId = currentUser.receivedRequests.filter(r => r.requestor===user._id)[0]._id;

        fetch(`${process.env.REACT_APP_URL}/friends/${friendRequestId}/reject`, {
            method: "PUT",
            credentials: "include",
        });

        setHasReceivedRequest(false);

        setButtonsDisabled(false);
    }

    function deleteFriend(){
        setButtonsDisabled(true);

        fetch(`${process.env.REACT_APP_URL}/friends/remove/${user._id}`, {
            method: "PUT",
            credentials: "include",
        });

        setIsFriend(false);

        setButtonsDisabled(false);
    }
    
    return (
        <Box sx={{
            width: '100%',
            padding: "6px",
            }}
        >
            <Grid item xs={12} s={7}>
                <Card   data-testid="userCard"
                        sx={{
                            display:"flex",
                            padding: "10px",
                            alignItems: "center",
                            position: "relative",
                        }}
                >
                    <CardHeader onClick={handleViewButtonClick}
                        avatar={<Avatar src={user.image} alt="user-image" />}
                        title={user.name} data-testid="user-image"
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

                    <Typography variant="h7" onClick={handleViewButtonClick} data-testid="user-name"
                        sx={{
                            paddingLeft: "25px",
                            paddingRight: "25px",
                        }}
                    >{user.firstName} {user.lastName}</Typography>

                    {/* Buttons for interacting as a friend with the displayed user */}

                    <Box sx={{display : "flex", flexDirection: {xs: "column", sm : "row"}, gap: "0.5rem"}}>

                        {isFriend && <Button onClick={deleteFriend} variant="contained" color="error" data-testid="del-friend-btn">
                            Remove Friend
                        </Button>}

                        {hasReceivedRequest && <Button disabled={buttonsDisabled} onClick={acceptFriend} variant="contained" color="success" fullwidth="true" startIcon={<EditIcon />} sx={{ marginTop: "2px" }} data-testid="accept-req-btn">
                            Accept Friend Request
                        </Button>}

                        {hasReceivedRequest && <Button disabled={buttonsDisabled} onClick={declineFriend} variant="contained" color="error" fullwidth="true" startIcon={<EditIcon />} sx={{ marginTop: "2px" }} data-testid="reject-req-btn">
                            Decline Friend Request
                        </Button>}          

                        {hasSentRequest && <Button disabled={buttonsDisabled} variant="outlined" disabled fullwidth="true" startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}} data-testid="sent-req-btn">
                            Request Sent
                        </Button>} 

                        {!hasSentRequest && !hasReceivedRequest && !isFriend && 
                        <Button disabled={buttonsDisabled} onClick={sendFriendRequest} variant="outlined" fullwidth="true" startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}} data-testid="add-friend-btn">
                            Add Friend
                        </Button>}

                    </Box>                          
                </Card>
            </Grid>
        </Box>		
	);
}
