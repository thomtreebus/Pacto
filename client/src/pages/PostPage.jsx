import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";
import CommentBox from "../components/CommentBox";

import CommentCard from "../components/cards/CommentCard";
import PostCard from "../components/cards/PostCard";

export default function PostPage() {
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
  }, [pactID, postID, history]);

  if(isLoading){
    return <Loading/>
  }

  // This callback function handles a simple addition of a new comment to the post.
  const commentSubmissionHandler = (newComment) => {
    setShowReplyBox(false);

    const newPostObj = JSON.parse(JSON.stringify(post)); // Deep clone the post so it can be modified and resaved
    newPostObj.comments.unshift(newComment); // Add new comment to front of comments array ( to render at top)

    setPost(newPostObj);
  }

  // This callback function is used when the change to the post object occurs on a deeper recursive layer
  // and is thus better handled inside the component.
  const recieveUpdatedPostObj = (newPostObj) => {
    setPost(newPostObj);
  }

  return (post&&
    <>
      <Grid container width={"60vw"}>
        <Grid item xs={16} lg={14} paddingBottom={4}>
          <PostCard post={post} numComments={post.comments.length}></PostCard>
          <Typography variant="caption" className="link" onClick={() => {setShowReplyBox(!showReplyBox)}} data-testid="comment-adder">
            {showReplyBox ? "Hide" : "Add comment"}
          </Typography>
          {showReplyBox && <Box>
            <CommentBox post={post} successHandler={commentSubmissionHandler}></CommentBox>
          </Box>}
        </Grid>
        <Box sx={{width: "95%", marginInline: "auto"}}>
          <Grid item xs={16} lg={14} data-testid="comment-list">
            {/* We display only the comments without a parentComment, i.e. top level comments */}
            { post.comments.filter((x) => x.parentComment == null).map((c) => {
              return(
                <CommentCard key={c._id} post={post} comment={c} postUpdaterFunc={recieveUpdatedPostObj}> </CommentCard>
              );
            })}
          </Grid>
        </Box>
      </Grid>
    </>
  );
}
