import { Fab, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutPact from "../components/AboutPact";
import PostList from "../components/PostList";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";

import AddIcon from '@mui/icons-material/Add';
import CommentCard from "../components/cards/CommentCard";

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
  return (
    <>
      <Grid container width={"50vw"}>
        <Grid item xs={16} lg={14}>
          { post && <CommentCard post={post} comment={post.comments[0]}></CommentCard> }
        </Grid>
        <Grid item lg={4}>
          <Box sx={{ paddingTop: "16px", paddingRight: "16px" }} display={{ xs: "none", lg: "block" }} position={"sticky"} top={65}>
            {/* { pact && <AboutPact pact={pact} /> } */}
          </Box>
        </Grid>
      </Grid>
      <Box position={"fixed"} bottom={50} right={300}>
        <Fab color="primary" aria-label="add">
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}
