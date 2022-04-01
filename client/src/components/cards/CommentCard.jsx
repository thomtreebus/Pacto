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
import { relativeTime } from "../../helpers/timeHandler";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import ErrorMessage from "../ErrorMessage";
import CollapsingText from "../CollapsingText";

export const DELETED_COMMENT_MESSAGE = "This comment has been deleted.";

export default function CommentCard({ comment, post, postUpdaterFunc }) {
  const { user } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const history = useHistory();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

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

  const updateComment = (updatedComment, replies=[]) => {
    const newPostObj = JSON.parse(JSON.stringify(post)); // Deep clone the post, so it can be modified and re-saved

    const indexOfCommentToUpdate = post.comments.indexOf(comment);
    newPostObj.comments = newPostObj.comments.filter(c => c._id !== comment._id); // Remove comment from post
    newPostObj.comments.splice(indexOfCommentToUpdate, 0, updatedComment); // Add updated comment to post in its place

    replies.forEach((reply) => {
      updatedComment.childComments.unshift(reply); // Add reply of comment to its children
      newPostObj.comments.unshift(reply); // Add reply of comment to overall list of comments (for rendering)
    })
    
    postUpdaterFunc(newPostObj); // Send LOCALLY updated post object to parent. Server side updates itself. We are avoiding refresh
  }

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
      const json = await response.json();

      if (response.status !== 200) {
        throw Error(json.errors?.length ? json.errors[0].message : "Server Error");
      }
      
      const newComment = json.message;
      updateComment(newComment);  
    } 
    catch (err) {
      setIsError(true);
      setErrorMessage(err.message);
      setIsButtonDisabled(false);
    }
  };

  const replySubmissionHandler = (newComment) => {
    setShowReplyBox(false);
    const newRepliedToCommentObj = JSON.parse(JSON.stringify(comment)); // Deep clone the replied-tocomment, so it can be modified and re-saved
    
    updateComment(newRepliedToCommentObj, [newComment]);
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

          <Box sx={{ overflow: "hidden", wordBreak: "break-word" }}>
            <Typography variant="caption" data-testid="author-date-line">
              Posted by <span onClick={() => history.push(`/user/${comment.author._id}`)} className="link" data-testid="author">{comment.author.firstName + " " + comment.author.lastName}</span> {relativeTime(comment.createdAt)}
            </Typography>

            <CollapsingText 
              text={comment.deleted ? DELETED_COMMENT_MESSAGE : comment.text}
              variant="body1"
              color={`${comment.deleted ? 'error' : 'inherit'}`}
              textDataTestId="comment-text"
            />

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
            <Accordion data-testid="show-replies">
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
                {comment.childComments.map(c => post.comments.filter(p=> p._id===c._id)[0]).map((c) => (<CommentCard key={c._id} post={post} comment={c} postUpdaterFunc={postUpdaterFunc} />))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>}
        </Box>
        {((comment.author._id === user._id ||
						post.pact.moderators?.includes(user._id)) && !comment.deleted) && (
						<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
							<IconButton
								color="error"
								onClick={handleDelete}
								disabled={isButtonDisabled}
                data-testid="delete-button"
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