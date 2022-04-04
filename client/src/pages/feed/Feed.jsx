/**
 * A feed page that displays all the posts of the Pacts the user is a part of
 */

import React, { useEffect, useState } from 'react'
import ErrorComponent from "../../components/errors/ErrorComponent";
import Loading from "../../components/Loading";
import PostList from '../../components/lists/PostList';
import { Grid, Box } from '@mui/material';

/**
 * Feed displays posts that the user is a pact of.
 * @returns {JSX.Element}
 * @constructor
 */
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
      if (err.name === "AbortError") return;
      setError(err.message);
      setIsLoading(false);
    })
    return () => controller.abort();
	}, [])
 	

	return (
		<>
    { isLoading && <Loading /> }
    {error && <ErrorComponent />}
    <Box sx={{width: "95%", marginInline: "auto", display: "flex"}} justifyContent="center">
      <Grid item xs={12} lg={10} data-testid="comment-list">
        {posts && <PostList posts={posts} showPact={true}/>}
      </Grid>
    </Box>
    </>
	);
}
