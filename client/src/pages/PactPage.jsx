import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutPact from "../components/AboutPact";
import PostList from "../components/PostList";
import ErrorPage from "./Error";
import Loading from "./Loading";

const testdata = [
  {
    author: {
      firstName: "Krishi",
      lastName: "Wali",
      _id: 1
    },
    date: "5/5/5",
    title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 6,
    upvoted: false,
    downvoted: false,
    comments: [0,0,0,0]
  },
  {
    author: {
      firstName: "John",
      lastName: "Doe",
      _id: 2
    },
    date: "04/02/2022",
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 4,
    upvoted: false,
    downvoted: true,
    comments: []
  },
  {
    author: {
      firstName: "Jane",
      lastName: "Doe",
      _id: 3
    },
    date: "05/34/3932",
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 8,
    upvoted: true,
    downvoted: false,
    comments: [1,23,6,6,6,6,6,6,6]
  },
  {
    author: {
      firstName: "Krishi",
      lastName: "Wali",
      _id: 1
    },
    date: "5/5/5",
    title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 6,
    upvoted: false,
    downvoted: false,
    comments: [0,0,0,0]
  },
  {
    author: {
      firstName: "John",
      lastName: "Doe",
      _id: 2
    },
    date: "04/02/2022",
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 4,
    upvoted: false,
    downvoted: true,
    comments: []
  },
  {
    author: {
      firstName: "Jane",
      lastName: "Doe",
      _id: 3
    },
    date: "05/34/3932",
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 8,
    upvoted: true,
    downvoted: false,
    comments: [1,23,6,6,6,6,6,6,6]
  },
];

export default function PactPage() {
  const { pactID } = useParams();
  const [posts, setPosts] = useState(true);
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
    {/* { isLoading && <Loading /> }
    { error && <ErrorPage /> } */}
      <Grid container width={"50vw"}>
        <Grid item xs={12} lg={8}>
          { posts && <PostList posts={testdata}/> }
        </Grid>
        <Grid item lg={4}>
          <Box sx={{ paddingTop: "16px", paddingRight: "16px" }} display={{ xs: "none", lg: "block" }} position={"sticky"} top={65}>
            { posts && <AboutPact pact={{ description: "Hello I am Pact", posts: [0,0,0,0,0,0,0,0], members: [0,0,0,0,0,0], name: "The Coolest Pact" }} /> }
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
