/**
 * A card to display a user and moderate them
 */

import {Box, Grid, Card, CardHeader, Avatar, Typography } from "@mui/material"
import {useHistory} from "react-router-dom";
import {useAuth} from "../../providers/AuthProvider";
import React, {useEffect, useState} from "react";
import ErrorMessage from "../errors/ErrorMessage";
import BanIcon from '@mui/icons-material/DoNotDisturbOn';
import UnBanIcon from '@mui/icons-material/DoDisturbOff';
import PromoteIcon from '@mui/icons-material/Star';
import { Tooltip } from "@mui/material";
import { IconButton } from "@mui/material";

/**
 * Displays a user ready for moderation
 * @param {Object} user
 * @param {Object} pact
 * @param {boolean} showBannedUsers
 */
export default function UserCardModeration({user, pact, showBannedUsers}) {

  const history = useHistory();
  const {user: loggedInUser, silentUserRefresh} = useAuth();
  const [showPromoteButton, setShowPromoteButton] = useState(false);
  const [showUnBanButton, setShowUnBanButton] = useState(false);
  const [showBanButton, setShowBanButton] = useState(false);
  const [loggedInUserIsMod, setLoggedInUserIsMod] = useState(false);
  const [userCardIsMod, setUserCardIsMod] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  function handleViewButtonClick() {
    history.push(`/user/${user._id}`);
  }

  async function handleButtonClick(type) {
    const response = await fetch(`${process.env.REACT_APP_URL}/pact/${pact._id}/${user._id}/${type}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
      }),
    });
    const json = await response.json()
    if(response.ok){
      await silentUserRefresh();
    }
    else{
      setErrorMessage(json.errors[0]['message'])
      setIsError(true);
    }
  }

  useEffect(() => {
    if (loggedInUserIsMod !== undefined) {
      setShowPromoteButton(
        loggedInUserIsMod && user._id !== loggedInUser._id && !userCardIsMod && !showBannedUsers
      );
      setShowBanButton(
        loggedInUserIsMod && user._id !== loggedInUser._id && !userCardIsMod && !showBannedUsers
      )
      setShowUnBanButton((
        showBannedUsers
      ))

    }
  }, [loggedInUserIsMod, loggedInUser, showBannedUsers, user, userCardIsMod])

  useEffect(() => {
    if (pact) {
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
  }, [pact, user, loggedInUser])

  return (
    <>
    <Box sx={{
      width: '100%',
      padding: "6px",
    }}
    >
      <Grid item xs={12} s={7}>
        <Card
              data-testid="userCard"
              sx={{
                display: "flex",
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
                data-testid="user-image-avatar"
                src={user.image}
                alt="user-image"
                onClick={handleViewButtonClick}
                style={{
                  outline: userCardIsMod ? '3px solid gold' : ''
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
                        marginRight: "auto"
                      }}
          >{user.firstName} {user.lastName}</Typography>
          {showPromoteButton &&
            <Tooltip title="Promote">
              <IconButton data-testid={"promote-button"} onClick={() => handleButtonClick("promote")} >
                <PromoteIcon color="warning" fontSize="large" sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </Tooltip>
          }
          {showBanButton &&
            <Tooltip title="Ban">
              <IconButton data-testid={"ban-button"} onClick={() => handleButtonClick("ban")} >
                <BanIcon color="error" fontSize="large"  sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </Tooltip>
          }
          {showUnBanButton &&
            <Tooltip title="Revoke Ban">
              <IconButton data-testid={"unban-button"} onClick={() => handleButtonClick("revokeban")} >
                <UnBanIcon color="success" fontSize="large"  sx={{border: "0.2rem solid", borderRadius: "5px"}} />
              </IconButton>
            </Tooltip>
          }
        </Card>
      </Grid>
    </Box>
      <ErrorMessage
        isOpen={isError}
        setIsOpen={setIsError}
        message={errorMessage}
      />
    </>
  );
}
