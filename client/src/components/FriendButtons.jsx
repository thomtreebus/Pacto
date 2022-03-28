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

  const FRIEND_EVENT_STATUS_CODES = {
    ACCEPT_REQ: 0,
    REJECT_REQ: 1,
    REMOVE_FRIEND: 2,
    ADD_FRIEND: 3
  }

  const friendEvent = async (status) => {
    setButtonsDisabled(true);

    // Forward request to backend
    const url = (() => {
      switch(status) {
        case FRIEND_EVENT_STATUS_CODES.ACCEPT_REQ: return `friends/${friendRequest}/accept`;
        case FRIEND_EVENT_STATUS_CODES.REJECT_REQ: return `friends/${friendRequest}/reject`;
        case FRIEND_EVENT_STATUS_CODES.REMOVE_FRIEND: return `friends/remove/${displayedUser._id}`;
        case FRIEND_EVENT_STATUS_CODES.ADD_FRIEND: return `friends/${displayedUser._id}`;
        // no default
      }
    })()

    const response = await fetch(`${process.env.REACT_APP_URL}/${url}`, {
      method: (status === 3) ? "POST" : "PUT",
      credentials: "include",
    });
    
    // Update state on success
    if(response.ok){
      switch(status) {
        case FRIEND_EVENT_STATUS_CODES.ACCEPT_REQ: { // Accepting request
          setHasReceivedRequest(false);
          setIsFriend(true);
        }
        case FRIEND_EVENT_STATUS_CODES.REJECT_REQ: { // Declining request
          setHasReceivedRequest(false);
        }
        case FRIEND_EVENT_STATUS_CODES.REMOVE_FRIEND: { // Removing friend
          setIsFriend(false);
        };
        case FRIEND_EVENT_STATUS_CODES.ADD_FRIEND: { // Sending request
          setHasSentRequest(true);
        };
        // no default
      }
    }

    setButtonsDisabled(false);
    await silentUserRefresh();
  }

  return (
    <Box sx={{marginLeft : "auto"}}>
      <Box sx={{display : "flex", flexDirection: {xs: "column", sm : "row"}, gap: "0.5rem"}} data-testid="friend-buttons">
        {isFriend && 
        <Tooltip title="Remove Friend">
            <span>
              <IconButton data-testid="del-friend-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT_STATUS_CODES.REMOVE_FRIEND)} >
                <RemoveFriendIcon color="error" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>
        }

        {hasReceivedRequest && 
          <Tooltip title="Accept Friend Request">
            <span>
              <IconButton data-testid="accept-req-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT_STATUS_CODES.ACCEPT_REQ)} >
                <AcceptIcon color="success" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>
        }

        {hasReceivedRequest &&
          <Tooltip title="Decline Friend Request">
            <span>
              <IconButton  data-testid="reject-req-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT_STATUS_CODES.REJECT_REQ)} >
                <RejectIcon color="error" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        }          

        {hasSentRequest &&
          <Tooltip title="Request Sent">
            <span>
              <IconButton  data-testid="sent-req-btn" disabled >
                <AddFriendIcon color="diabled" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        } 

        {!hasSentRequest && !hasReceivedRequest && !isFriend &&           
          <Tooltip title="Add Friend">
            <span>
              <IconButton data-testid="add-friend-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT_STATUS_CODES.ADD_FRIEND)} >
                <AddFriendIcon color="primary" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        }
      </Box>        
    </Box>
  );
}
