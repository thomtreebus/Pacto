/**
 * Provides buttons to perform actions such as adding/removing friends
 * or accepting/rejecting them
 */

import { Box } from "@mui/material"
import { useState } from "react";
import AddFriendIcon from '@mui/icons-material/PersonAdd';
import RemoveFriendIcon from '@mui/icons-material/PersonRemove';
import AcceptIcon from '@mui/icons-material/Check';
import RejectIcon from '@mui/icons-material/Close';
import { Tooltip, IconButton } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

/**
 * Buttons to accept/reject friend requests, or add/remove friends.
 * @param {Object} user The user the profile belongs to
 */
export default function FriendButtons({user}){
  const {user : currentUser, silentUserRefresh} = useAuth();
  const [isFriend, setIsFriend] = useState(currentUser.friends && currentUser.friends.includes(user._id));
  const [hasSentRequest, setHasSentRequest] = useState(currentUser.sentRequests && currentUser.sentRequests.some(r => r.recipient === user._id));
  const [hasReceivedRequest, setHasReceivedRequest] = useState(currentUser.receivedRequests && currentUser.receivedRequests.some(r => r.requestor === user._id));
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  // A user cannot send requests to themselves!!
  if(currentUser._id === user._id){
    return null;
  }

  const FRIEND_EVENT = {
    ACCEPT_REQ: 0,
    REJECT_REQ: 1,
    REMOVE_FRIEND: 2,
    ADD_FRIEND: 3
  }

  const friendEvent = async (status) => {
    setButtonsDisabled(true);

    const friendRequest = currentUser.receivedRequests && currentUser.receivedRequests.filter(r => r.requestor === user._id)[0];

    // Forward request to backend
    const url = (() => {
      switch(status) {
        case FRIEND_EVENT.ACCEPT_REQ: return `friends/${friendRequest._id}/accept`;
        case FRIEND_EVENT.REJECT_REQ: return `friends/${friendRequest._id}/reject`;
        case FRIEND_EVENT.REMOVE_FRIEND: return `friends/remove/${user._id}`;
        case FRIEND_EVENT.ADD_FRIEND: return `friends/${user._id}`;
        // no default
      }
    })()

    const response = await fetch(`${process.env.REACT_APP_URL}/${url}`, {
      method: (status === FRIEND_EVENT.ADD_FRIEND) ? "POST" : "PUT",
      credentials: "include",
    });
    
    // Update state on success
    if(response.ok){
      switch(status) {
        case FRIEND_EVENT.ACCEPT_REQ:
          setHasReceivedRequest(false);
          setIsFriend(true);
          break;
        case FRIEND_EVENT.REJECT_REQ:
          setHasReceivedRequest(false);
          break;
        case FRIEND_EVENT.REMOVE_FRIEND:
          setIsFriend(false);
          break;
        case FRIEND_EVENT.ADD_FRIEND:
          setHasSentRequest(true);
          break;
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
              <IconButton data-testid="del-friend-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT.REMOVE_FRIEND)} >
                <RemoveFriendIcon color="error" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>
        }

        {hasReceivedRequest && 
          <Tooltip title="Accept Friend Request">
            <span>
              <IconButton data-testid="accept-req-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT.ACCEPT_REQ)} >
                <AcceptIcon color="success" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>
        }

        {hasReceivedRequest &&
          <Tooltip title="Decline Friend Request">
            <span>
              <IconButton  data-testid="reject-req-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT.REJECT_REQ)} >
                <RejectIcon color="error" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        }          

        {hasSentRequest &&
          <Tooltip title="Request Sent">
            <span>
              <IconButton  data-testid="sent-req-btn" disabled >
                <AddFriendIcon color="disabled" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        } 

        {!hasSentRequest && !hasReceivedRequest && !isFriend &&           
          <Tooltip title="Add Friend">
            <span>
              <IconButton data-testid="add-friend-btn" disabled={buttonsDisabled}  onClick={()=>friendEvent(FRIEND_EVENT.ADD_FRIEND)} >
                <AddFriendIcon color="primary" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </span>
          </Tooltip>   
        }
      </Box>        
    </Box>
  );
}
