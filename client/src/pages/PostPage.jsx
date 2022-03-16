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
      console.log(data.message);
    }).catch((err) => {
      setIsLoading(false);
      //history.push("/not-found");
      console.log(err.message)
      
    })
  }, [pactID, postID, history])


  if(isLoading){
    return <Loading/>
  }
  return (post&&
    <>
      <Grid container width={"60vw"}>
        <Grid item xs={16} lg={14} paddingBottom={4}>
          <PostCard post={post}></PostCard>
        </Grid>
        <Grid item xs={16} lg={14}>
          { <CommentCard post={post} comment={post.comments[0]}></CommentCard> }
        </Grid>
      </Grid>
    </>
  );
}
