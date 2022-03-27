import React, { useEffect, useState } from 'react'
import ErrorPage from "./Error";
import Loading from "./Loading";
import PostList from '../components/PostList';
import { Grid, Box } from '@mui/material';

export default function Feed() {
	const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState(null);

	useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.REACT_APP_URL}/feed`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch feed");
      }
      return res.json();
    }).then((data) => {
      setPosts(data.message);
      setIsLoading(false);
      setError(null);
		}).catch((err) => {
      if (err.message === "The user aborted a request.") return;
    })
    return () => controller.abort();
	}, [])
 	

	return (
		<>
    { isLoading && <Loading /> }
    {error && <ErrorPage />}
    <Box sx={{width: "95%", marginInline: "auto", display: "flex"}} justifyContent="center">
      <Grid item xs={12} lg={10} data-testid="comment-list">
        {posts && <PostList posts={posts}/>}
      </Grid>
    </Box>
    </>
	);
}
