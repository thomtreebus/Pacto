import { Box, Button } from "@mui/material"
import { useState } from "react";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';

export default function FriendButtons({currentUser, user}){ // logged in user and user to be interacted with

  const [isFriend, setIsFriend] = useState(currentUser.friends && currentUser.friends.includes(user._id));
  const [hasSentRequest, setHasSentRequest] = useState(currentUser.sentRequests && currentUser.sentRequests.some(r => r.recipient === user._id));
  const [hasReceivedRequest, setHasReceivedRequest] = useState(currentUser.receivedRequests && currentUser.receivedRequests.some(r => r.requestor === user._id));
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  // A user cannot send requests to themselves!!
  if(currentUser._id === user._id){
    return null;
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
    <Box sx={{display : "flex", flexDirection: {xs: "column", sm : "row"}, gap: "0.5rem"}} data-testid="friend-buttons">

      {isFriend && <Button disabled={buttonsDisabled} onClick={deleteFriend} variant="contained" color="error" data-testid="del-friend-btn">
          Remove Friend
      </Button>}

      {hasReceivedRequest && <Button disabled={buttonsDisabled} onClick={acceptFriend} variant="contained" color="success" fullwidth="true" startIcon={<EditIcon />} sx={{ marginTop: "2px" }} data-testid="accept-req-btn">
          Accept Friend Request
      </Button>}

      {hasReceivedRequest && <Button disabled={buttonsDisabled} onClick={declineFriend} variant="contained" color="error" fullwidth="true" startIcon={<EditIcon />} sx={{ marginTop: "2px" }} data-testid="reject-req-btn">
          Decline Friend Request
      </Button>}          

      {hasSentRequest && <Button variant="outlined" disabled fullwidth="true" startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}} data-testid="sent-req-btn">
          Request Sent
      </Button>} 

      {!hasSentRequest && !hasReceivedRequest && !isFriend && 
      <Button disabled={buttonsDisabled} onClick={sendFriendRequest} variant="outlined" fullwidth="true" startIcon={<PersonAddIcon />} sx={{marginTop: "4px"}} data-testid="add-friend-btn">
          Add Friend
      </Button>}

  </Box>        
  );
}
