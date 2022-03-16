import { Box, Card, CardContent, IconButton } from "@mui/material";
import { useState } from "react";
import { Typography } from "@mui/material";
import { useHistory } from "react-router-dom";

import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";
import CommentIcon from '@mui/icons-material/Comment';

import { useAuth } from "../../providers/AuthProvider";

export default function BasePostCard({ children, post, repliable=false }) {
  const { user } = useAuth();
  const [thumbUp, setThumbUp] = useState(post.upvoters.includes(user._id));
  const [thumbDown, setThumbDown] = useState(post.downvoters.includes(user._id));
  const [likes, setLikes] = useState(post.votes);

  const history = useHistory();

  const handleLikeEvent = async (eventCode) => {
    const url = (() => {
      switch(eventCode) {
        case 0: return `pact/${post.pact}/post/upvote/${post._id}`;
        case 1: return `pact/${post.pact}/post/downvote/${post._id}`;
        // no default
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
              Posted by <span onClick={() => history.push(`/user/${post.author._id}`)} className="link" data-testid="author">{post.author.firstName + " " + post.author.lastName}</span> on {post.createdAt}
            </Typography>

            <Typography variant="h6" data-testid="title">
              {post.title}
            </Typography>

            {children}

            <Typography variant="subtitle2" className="link" data-testid="comments" onClick={() => 
                history.push(`/pact/${post.pact._id}/post/${post._id}${repliable ? "/comment":""}`)}>
              <CommentIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
              {!repliable ? 
                `${post.comments.length} ${post.comments.length === 1 ? "Comment" : "Comments"}`
              :
                `Reply`
              }
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
