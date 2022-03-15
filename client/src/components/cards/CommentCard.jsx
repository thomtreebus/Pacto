import { Box, Card, CardContent, IconButton } from "@mui/material";
import { useState } from "react";
import { Typography } from "@mui/material";
import { useHistory } from "react-router-dom";

import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";

import { useAuth } from "../../providers/AuthProvider";

export default function CommentCard({ comment, post }) {
  const { user } = useAuth();
  const [thumbUp, setThumbUp] = useState(post.upvoters.includes(user._id));
  const [thumbDown, setThumbDown] = useState(post.downvoters.includes(user._id));
  const [likes, setLikes] = useState(post.votes);

  const history = useHistory();
  const author = comment.author;

  const handleLikeEvent = async (eventCode) => {
    const url = (() => {
      let action = null;
      switch(eventCode) {
        case 0: action = "upvote";
        case 1: action = "downvote";
        
        return `pact/${post.pact}/post/${post._id}/comment/${comment._id}/${action}`;
      }
    })()
    fetch(`${process.env.REACT_APP_URL}/${url}`, {
      method: "PUT",
      credentials: "include",
    });
	};

  return (
    <Card sx={{ width: "100%" }} data-testid="card">
      <CardContent>
        <Box sx={{ overflow: "hidden" }}>
          <Box sx={{ float: "left", paddingRight: "16px", textAlign: "center" }}>
            <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} onClick={() => {
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

            <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} onClick={() => {
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

          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="caption" data-testid="author-date-line">
              Posted by <span onClick={() => history.push(`/user/${author._id}`)} className="link" data-testid="author">{author.firstName + " " + author.lastName}</span> on {comment.createdAt}
            </Typography>

            <Typography variant="body1" data-testid="title">
              {comment.text}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}