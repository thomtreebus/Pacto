import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutPact from "../components/AboutPact";
import PostList from "../components/PostList";
import ErrorPage from "./Error";
import Loading from "./Loading";

export default function PactPage() {
  const { pactID } = useParams();
  const [posts, setPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/pact/${pactID}/posts`, {
      method: "GET",
      credentials: "include"
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch posts");
      }
      return res.json();
    }).then((data) => {
      setPosts(data.message);
      setIsLoading(false);
      setError(null);
    }).catch((err) => {
      setError(err);
      setIsLoading(false);
    })
  }, [])

  return (
    <>
    { isLoading && <Loading /> }
    { error && <ErrorPage /> }
      <Grid container width={"50vw"}>
        <Grid item xs={12} lg={8}>
          { posts && <PostList posts={testdata}/> }
        </Grid>
        <Grid item lg={4}>
          <Box sx={{ paddingTop: "16px", paddingRight: "16px" }} display={{ xs: "none", lg: "block" }} position={"sticky"} top={65}>
            <AboutPact pact={{ description: "Hello I am Pact", posts: [0,0,0,0,0,0,0,0], members: [0,0,0,0,0,0], name: "The Coolest Pact" }} />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
