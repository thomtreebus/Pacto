/**
 * Page that allows users to create a post to a certain Pact
 */

import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../../../components/Loading";
import { useHistory } from "react-router-dom";
import CommentBox from "../../../../components/CommentBox";
import CommentCard from "../../../../components/cards/CommentCard";
import PostCard from "../../../../components/cards/PostCard";
import { useAuth } from "../../../../providers/AuthProvider";

/**
 * A full page representation of a post showcasing
 * its comments and the ability to comment on a post.
 * @returns {JSX.Element}
 */
export default function Post() {
  const { user } = useAuth()
  const { pactID, postID } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const history = useHistory();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_URL}/pact/${pactID}/post/${postID}`, {
      method: "GET",
      credentials: "include"
    })
    .then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch post");
      }
      return res.json();
    })
    .then((data) => {
      
      setPost(data.message);
      
      setIsLoading(false);
    })
    .catch((err) => {
      setIsLoading(false);
      history.push("/not-found");
    });
  }, [pactID, postID, history, user]);

  if(isLoading){
    return <Loading/>
  }

  // This callback function handles a simple addition of a new comment to the post.
  const commentSubmissionHandler = (newComment) => {
    setShowReplyBox(false);

    const newPostObj = JSON.parse(JSON.stringify(post)); // Deep clone the post, so it can be modified and re-saved
    newPostObj.comments.unshift(newComment); // Add new comment to front of comments array ( to render at top)

    setPost(newPostObj);
  }

  // This callback function is used when the change to the post object occurs on a deeper recursive layer
  // and is thus better handled inside the component.
  const receiveUpdatedPostObj = (newPostObj) => {
    setPost(newPostObj);
  }

  return (post&&
    <>
      <Grid container width="100%" justifyContent="center" sx={{marginTop: 3}}>
        <Grid item xs={11} paddingBottom={1}>
          <PostCard post={post} />
          <Typography variant="subtitle1" className="link" onClick={() => {setShowReplyBox(!showReplyBox)}} data-testid="comment-adder">
            {showReplyBox ? "Hide" : "Add comment"}
          </Typography>
          {showReplyBox && <Box>
            <CommentBox post={post} successHandler={commentSubmissionHandler}/>
          </Box>}
        </Grid>
        <Box sx={{width: "95%", marginInline: "auto", display: "flex"}} justifyContent="center">
          <Grid item xs={10} data-testid="comment-list">
            {/* We display only the comments without a parentComment, i.e. top level comments */}
            { post.comments.filter((x) => x.parentComment == null).map((c) => {
              return(
                <CommentCard key={c._id} post={post} comment={c} postUpdaterFunc={receiveUpdatedPostObj}> </CommentCard>
              );
            })}
          </Grid>
        </Box>
      </Grid>
    </>
  );
}
