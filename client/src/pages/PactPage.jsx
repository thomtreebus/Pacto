import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostList from "../components/PostList";
import Error from "./Error";
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
    { error && <Error /> }
    <Box sx={{ maxWidth: "50vw" }}>
      { posts && <PostList posts={posts}/> }
    </Box>
    </>
  );
}
