import React, { useEffect, useState } from 'react'
import ErrorPage from "./Error";
import Loading from "./Loading";
import PostList from '../components/PostList';

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
      return res.json();
    }).then((data) => {
      setPosts(data.message);
      setIsLoading(false);
      setError(null);
		})
    return () => controller.abort();
	}, [])
 	

	return (
		<>
    { isLoading && <Loading /> }
    {error && <ErrorPage />}
    {posts && <PostList posts={posts}/>}
    </>
	);
}
