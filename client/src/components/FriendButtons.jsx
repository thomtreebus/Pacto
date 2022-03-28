import { Box } from "@mui/material"
import { useState } from "react";
import AddFriendIcon from '@mui/icons-material/PersonAdd';
import RemoveFriendIcon from '@mui/icons-material/PersonRemove';
import AcceptIcon from '@mui/icons-material/Check';
import RejectIcon from '@mui/icons-material/Close';
import { Tooltip, IconButton } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

export default function FriendButtons({user}){ // logged in user and user to be interacted with
  const {user : currentUser, silentUserRefresh} = useAuth();
  const [isFriend, setIsFriend] = useState(currentUser.friends && currentUser.friends.includes(user._id));
  const [hasSentRequest, setHasSentRequest] = useState(currentUser.sentRequests && currentUser.sentRequests.some(r => r.recipient === user._id));
  const [hasReceivedRequest, setHasReceivedRequest] = useState(currentUser.receivedRequests && currentUser.receivedRequests.some(r => r.requestor === user._id));
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  // A user cannot send requests to themselves!!
  if(currentUser._id === user._id){
    return null;
  }

  async function sendFriendRequest() {
    setButtonsDisabled(true);

    await fetch(`${process.env.REACT_APP_URL}/friends/${user._id}`, {
        method: "POST",
        credentials: "include",
    });

    setHasSentRequest(true);

    setButtonsDisabled(false);

    await silentUserRefresh();
}

async function acceptFriend(){
    setButtonsDisabled(true);

    const friendRequestId = currentUser.receivedRequests.filter(r => r.requestor===user._id)[0]._id;

    await fetch(`${process.env.REACT_APP_URL}/friends/${friendRequestId}/accept`, {
        method: "PUT",
        credentials: "include",
    });

    setHasReceivedRequest(false);
    setIsFriend(true);

    setButtonsDisabled(false);

    await silentUserRefresh();
}

async function declineFriend(){
    setButtonsDisabled(true);

    const friendRequestId = currentUser.receivedRequests.filter(r => r.requestor===user._id)[0]._id;

    await fetch(`${process.env.REACT_APP_URL}/friends/${friendRequestId}/reject`, {
        method: "PUT",
        credentials: "include",
    });

    setHasReceivedRequest(false);

    setButtonsDisabled(false);

    await silentUserRefresh();
}

async function deleteFriend(){
    setButtonsDisabled(true);

    await fetch(`${process.env.REACT_APP_URL}/friends/remove/${user._id}`, {
        method: "PUT",
        credentials: "include",
    });

    setIsFriend(false);

    setButtonsDisabled(false);

    await silentUserRefresh();
}

  return (
    <Box sx={{marginLeft : "auto"}}>
      <Box sx={{display : "flex", flexDirection: {xs: "column", sm : "row"}, gap: "0.5rem"}} data-testid="friend-buttons">
        {isFriend && 
        <Tooltip title="Remove Friend">
            <span>
              <IconButton data-testid="del-friend-btn" disabled={buttonsDisabled}  onClick={deleteFriend} >
                <RemoveFriendIcon color="error" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>
        }

        {hasReceivedRequest && 
          <Tooltip title="Accept Friend Request">
            <span>
              <IconButton data-testid="accept-req-btn" disabled={buttonsDisabled}  onClick={acceptFriend} >
                <AcceptIcon color="success" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>
        }

        {hasReceivedRequest &&
          <Tooltip title="Decline Friend Request">
            <span>
              <IconButton  data-testid="reject-req-btn" disabled={buttonsDisabled}  onClick={declineFriend} >
                <RejectIcon color="error" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        }          

        {hasSentRequest &&
          <Tooltip title="Request Sent">
            <span>
              <IconButton  data-testid="sent-req-btn" disabled  onClick={declineFriend} >
                <AddFriendIcon color="diabled" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        } 

        {!hasSentRequest && !hasReceivedRequest && !isFriend &&           
          <Tooltip title="Add Friend">
            <span>
              <IconButton data-testid="add-friend-btn" disabled={buttonsDisabled}  onClick={sendFriendRequest} >
                <AddFriendIcon color="primary" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        }
      </Box>        
    </Box>
  );
}
