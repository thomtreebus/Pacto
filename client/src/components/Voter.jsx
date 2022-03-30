import { Box, IconButton } from "@mui/material";
import { useState } from "react";
import { Typography } from "@mui/material";


import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";

/**
 * A component to vote up or down a post/comment
 * @param {boolean} initThumbUp Initial state of thumb up
 * @param {boolean} initThumbDown Initial state of thumb down
 * @param {number} initLikes Initial state of thumb likes
 * @param {function} handleLikeEvent Function that handles an event when a button is pressed
 * @param {boolean} disabled Signifies if voting functionality should be disabled
 */
export default function Voter({initThumbUp, initThumbDown, initLikes, handleLikeEvent, disabled=false}){
  const [thumbUp, setThumbUp] = useState(initThumbUp);
  const [thumbDown, setThumbDown] = useState(initThumbDown);
  const [likes, setLikes] = useState(initLikes);

  return(
    <Box data-testid="voter" sx={{ float: "left", paddingRight: "16px", textAlign: "center" }}>
      <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} disabled={disabled} onClick={() => {
        if (thumbUp) {
          setLikes(likes - 1);
        } else if (thumbDown) {
          setLikes(likes + 2);
          setThumbDown(false);
        } else {
          setLikes(likes + 1);
        }
        setThumbUp(!thumbUp);
        handleLikeEvent(0);
      }}>
        <ThumbUpRoundedIcon color={thumbUp ? "primary" : "inherit"}/>
      </IconButton>

      <Typography data-testid="likes">
        {likes}
      </Typography>

      <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} disabled ={disabled} onClick={() => {
        if (thumbDown) {
          setLikes(likes + 1);
        } else if (thumbUp) {
          setLikes(likes - 2);
          setThumbUp(false);
        } else {
          setLikes(likes - 1);
        }
        setThumbDown(!thumbDown);
        handleLikeEvent(1);
      }}>
        <ThumbDownRoundedIcon color={thumbDown ? "secondary" : "inherit"}/>
      </IconButton>
    </Box>
  );
}