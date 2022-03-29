import { Box, Card, CardContent, Grid } from "@mui/material";
import { useState } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';import { useHistory } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import CommentBox from "../CommentBox";
import Voter from "../Voter";
import { relativeTime } from "../../helpers/timeHandllers";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import ErrorMessage from "../ErrorMessage";

export default function CommentCard({ comment, post, postUpdaterFunc }) {
  const { user, silentUserRefresh } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const history = useHistory();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

  const DELETED_COMMENT_MESSAGE = "This comment has been deleted.";

  const handleDelete = async () => {
    setIsButtonDisabled(true);

    const response = await fetch(
      `${process.env.REACT_APP_URL}/pact/${post.pact._id}/post/${post._id}/comment/${comment._id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    try {
      if (response.status !== 200) {
        const json = await response.json();
        if (json.errors.length) throw Error(json.errors[0].message);
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage(err.message);
      setIsButtonDisabled(false);
      return;
    }

    await silentUserRefresh();
    history.push(`/pact/${post.pact._id}/post/${post._id}`);
  };

  const handleLikeEvent = async (eventCode) => {
    const url = (() => {
      switch(eventCode) {
        case 0: return `pact/${post.pact._id}/post/${post._id}/comment/${comment._id}/upvote`;
        case 1: return `pact/${post.pact._id}/post/${post._id}/comment/${comment._id}/downvote`;
        // no default
      }
    })();
    fetch(`${process.env.REACT_APP_URL}/${url}`, {
      method: "PUT",
      credentials: "include",
    });
	};

  const replySubmissionHandler = (newComment) => {
    setShowReplyBox(false);
    const indexOfCommentToUpdate = post.comments.indexOf(comment);

    const newPostObj = JSON.parse(JSON.stringify(post)); // Deep clone the post so it can be modified and resaved
    const newRepliedToCommentObj = JSON.parse(JSON.stringify(comment)); // Deep clone the replied-tocomment so it can be modified and resaved
    
    newRepliedToCommentObj.childComments.unshift(newComment); // Add reply of comment to its children
    newPostObj.comments.unshift(newComment); // Add reply of comment to overall list of comments (for rendering)

    newPostObj.comments = newPostObj.comments.filter(c => c._id !== comment._id); // Remove replied-to comment from post
    newPostObj.comments.splice(indexOfCommentToUpdate, 0, newRepliedToCommentObj); // Add updated replied-to comment

    postUpdaterFunc(newPostObj); // Send updated post object to parent
  }

  if(!comment){
    return null;
  }

  return (comment&&
    <>
    <ErrorMessage
      isOpen={isError}
      setIsOpen={setIsError}
      message={errorMessage}
    />
    <Card sx={{ width: "100%", marginTop : 1, boxShadow: 3  }} data-testid="comment-card" >
      <CardContent>
        <Box sx={{ overflow: "hidden" }}>
          <Voter 
          initThumbUp={comment.upvoters.includes(user._id)} 
          initThumbDown={comment.downvoters.includes(user._id)} 
          handleLikeEvent={handleLikeEvent}
          initLikes={comment.votes}
          disabled={comment.deleted}>
          </Voter>

          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="caption" data-testid="author-date-line">
              Posted by <span onClick={() => history.push(`/user/${comment.author._id}`)} className="link" data-testid="author">{comment.author.firstName + " " + comment.author.lastName}</span> {relativeTime(comment.createdAt)}
            </Typography>

            <Typography variant="body1" color={`${comment.deleted ? 'error' : 'inherit'}`} data-testid="comment-text">
              {comment.deleted ? DELETED_COMMENT_MESSAGE : comment.text}
            </Typography>

            { !comment.deleted && <Typography variant="caption" className="link" onClick={() => {setShowReplyBox(!showReplyBox)}} data-testid="reply-button">
              {showReplyBox ? "Hide" : "Reply"}
              </Typography>
            }
          </Box>

          {showReplyBox && <Box>
            <CommentBox 
            post={post} 
            repliedToComment={comment} 
            successHandler={replySubmissionHandler}>
            </CommentBox>
          </Box>}

          {(comment.childComments.length > 0) && <Box sx = {{ overflow: "hidden"}} data-testid="child-comment-list">
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography>Show replies...</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid item xs={12} lg={12}>
                  {/* Here we map each child comment onto its respective document within the post object before display */}
                  {/* This is to avoid deep recursive population on the server side */}
                {comment.childComments.map(c => post.comments.filter(p=> p._id===c._id)[0]).map((c) => (<CommentCard key={c._id} post={post} comment={c} postUpdaterFunc={postUpdaterFunc}></CommentCard>))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>}
        </Box>
        {((comment.author._id === user._id ||
						post.pact.moderators.includes(user._id)) && !comment.deleted) && (
						<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
							<IconButton
								color="error"
								onClick={handleDelete}
								disabled={isButtonDisabled}
							>
								<DeleteIcon fontSize="medium" />
							</IconButton>
						</Box>
					)}
      </CardContent>
    </Card>
    </>
  )
}