import { Box, Card, CardContent, IconButton } from "@mui/material";
import { Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
<<<<<<< HEAD
=======
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";
>>>>>>> main
import CommentIcon from '@mui/icons-material/Comment';

import { useAuth } from "../../providers/AuthProvider";
import Voter from "../Voter";

const vagueTime = require("vague-time");

export default function BasePostCard({ children, post }) {
  const { user } = useAuth();
  const commentCount = (numComments === null ? post.comments.length : numComments);

  const relativeTime = (time) => {
    return vagueTime.get({
      from: Date.now(),
      to: new Date(time)
    });
  };

  const history = useHistory();

  const handleLikeEvent = async (eventCode) => {
    const url = (() => {
      switch(eventCode) {
        case 0: return `pact/${post.pact._id}/post/upvote/${post._id}`;
        case 1: return `pact/${post.pact._id}/post/downvote/${post._id}`;
        // no default
      }
    })();
    fetch(`${process.env.REACT_APP_URL}/${url}`, {
      method: "PUT",
      credentials: "include",
    });
	};

  return (
    <Card sx={{ width: "100%" }} data-testid="card">
      <CardContent>
        <Box sx={{ overflow: "hidden" }}>
          <Voter 
          initThumbUp={post.upvoters.includes(user._id)} 
          initThumbDown={post.downvoters.includes(user._id)} 
          handleLikeEvent={handleLikeEvent}
          initLikes={post.votes}>
          </Voter>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="caption" data-testid="author-date-line">
              Posted by <span onClick={() => history.push(`/user/${post.author._id}`)} className="link" data-testid="author">{post.author.firstName + " " + post.author.lastName}</span> {relativeTime(post.createdAt)}
            </Typography>

            <Typography variant="h6" data-testid="title">
              {post.title}
            </Typography>

            {children}

            <Typography variant="subtitle2" className="link" data-testid="comments" onClick={() => {history.push(`/pact/${post.pact._id}/post/${post._id}`)}}>
              <CommentIcon sx={{ verticalAlign: "middle", marginRight: "5px" }} />
              {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
