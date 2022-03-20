import { Box, Card, CardContent, IconButton, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';import { useHistory } from "react-router-dom";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";

import { useAuth } from "../../providers/AuthProvider";
import CommentBox from "../CommentBox";

export default function CommentCard({ comment, post, postUpdaterFunc }) {
  const { user } = useAuth();
  const [thumbUp, setThumbUp] = useState(post.upvoters.includes(user._id));
  const [thumbDown, setThumbDown] = useState(post.downvoters.includes(user._id));
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [likes, setLikes] = useState(post.votes);

  const history = useHistory();

  const handleLikeEvent = async (eventCode) => {
    const url = (() => {
      let action = null;
      switch(eventCode) {
        case 0: action = "upvote";
        case 1: action = "downvote";
        
        return `pact/${post.pact._id}/post/${post._id}/comment/${comment._id}/${action}`;
      }
    })()
    fetch(`${process.env.REACT_APP_URL}/${url}`, {
      method: "PUT",
      credentials: "include",
    });
	};

  const replySubmissionHandler = (newComment) => {
    setShowReplyBox(false);
    const indexOfCommentToUpdate = post.comments.indexOf(comment);

    const newPostObj = JSON.parse(JSON.stringify(post)); // Deep clone the post so it can be modified and resaved
    const newCommentObj = JSON.parse(JSON.stringify(comment)); // Deep clone the comment so it can be modified and resaved
    
    newCommentObj.childComments.unshift(newComment); // Add reply of comment to its children
    newPostObj.comments.unshift(newComment); // Add reply of comment to overall list of comments (for rendering)
    newPostObj.comments[indexOfCommentToUpdate] = newCommentObj; // Update replied-to comment in post.comments

    postUpdaterFunc(newPostObj); // Send updated post object to parent
  }

  if(!comment){
    return null;
  }

  return (comment&&
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
              Posted by <span onClick={() => history.push(`/user/${comment.author._id}`)} className="link" data-testid="author">{comment.author.firstName + " " + comment.author.lastName}</span> on {comment.createdAt}
            </Typography>

            <Typography variant="body1">
              {comment.text}
            </Typography>

            <Typography variant="caption" className="link" onClick={() => {setShowReplyBox(!showReplyBox)}}>
              {showReplyBox ? "Hide" : "Reply"}
            </Typography>
          </Box>

          {showReplyBox && <Box>
            <CommentBox 
            post={post} 
            repliedToComment={comment} 
            successHandler={replySubmissionHandler}>
            </CommentBox>
          </Box>}

          {(comment.childComments.length > 0) && <Box sx = {{ overflow: "hidden"}}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography>Show replies...</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid item xs={12} lg={12}>
                {comment.childComments.map(c => post.comments.filter(p=> p._id===c._id)[0]).map((c) => (<CommentCard post={post} comment={c}></CommentCard>))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>}
        </Box>
      </CardContent>
    </Card>
  )
}