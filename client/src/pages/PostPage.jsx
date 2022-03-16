import { Fab, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutPact from "../components/AboutPact";
import PostList from "../components/PostList";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";

import AddIcon from '@mui/icons-material/Add';
import CommentCard from "../components/cards/CommentCard";
import PostCard from "../components/cards/PostCard";


export default function PostPage() {
  const { pactID, postID } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_URL}/pact/${pactID}/post/${postID}`, {
      method: "GET",
      credentials: "include"
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch post");
      }
      return res.json();
    }).then((data) => {
      setPost(data.message);
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
      history.push("/not-found");
      //console.log(err.message)
    });
  }, [pactID, postID, history])


  if(isLoading){
    return <Loading/>
  }
  return (post&&
    <>
      <Grid container width={"60vw"}>
        <Grid item xs={16} lg={14} paddingBottom={4}>
          <PostCard post={post} repliable={true}></PostCard>
        </Grid>
        <Box sx={{width: "95%", marginInline: "auto"}}>
          <Grid item xs={16} lg={14}>
            { post.comments.filter((c) => c.parentComment == null)
            .map((c) => <CommentCard post={post} comment={c}></CommentCard>) }
          </Grid>
        </Box>
      </Grid>
    </>
  );
}
