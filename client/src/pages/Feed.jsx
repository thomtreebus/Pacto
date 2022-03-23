import React, { useEffect, useState } from 'react'
import ErrorPage from "./Error";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";
import PostList from '../components/PostList';

export default function Feed() {
	const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState(null);
	const history = useHistory();

	useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/feed`, {
      method: "GET",
      credentials: "include"
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not get feed posts");
      }
      return res.json();
    }).then((data) => {
      setPosts(data.message);
      console.log(data.message);
      setIsLoading(false);
      setError(null);
		}).catch((err) => {
      setPosts(null);
      setIsLoading(false);
      setError(err);
    })
	}, [])
 	

	return (
		<>
    { isLoading && <Loading /> }
    {error && <ErrorPage />}
    {posts && <PostList posts={posts}/>}

    </>
	);
}
