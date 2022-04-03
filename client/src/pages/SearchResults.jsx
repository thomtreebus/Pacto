/**
 * Allows the user to search for a particular Pact, post or user
 */

import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import ErrorComponent from "../components/ErrorComponent";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import PactGrid from "../components/PactGrid";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UserList from '../components/UserList';
import {TabPanel} from "../components/TabComponents";

/**
 * Search results gives us matching component matching
 * the user's search query.
 * @returns {JSX.Element}
 */
export default function SearchResults() {
  const { query } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [type, setType] = useState(0);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/search/${query}`, {
      method: "GET",
      credentials: "include"
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not get results");
      }
      return res.json();
    }).then((data) => {
      setResults(data.message);
      setIsLoading(false);
      setError(null);
    }).catch((err) => {
      setResults(null);
      setIsLoading(false);
      setError(err);
    })
  }, [query])

  const handleTabChange = (event, newType) => {
    setType(newType);
  };

  return (
    <>
    { isLoading && <Loading /> }
    {error && <ErrorComponent />}
    <Box sx={{ width: '100%'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={type} onChange={handleTabChange} centered data-testid="tabs-element">
          <Tab label="Pacts" />
          <Tab label="Posts" />
          <Tab label="Users" />
        </Tabs>
      </Box>
      <TabPanel value={type} index={0} data-testid="pact-grid">
        {results && <PactGrid pacts={results.pacts} />}
      </TabPanel>
      <TabPanel value={type} index={1} data-testid="post-list">
        {results && <PostList posts={results.posts} searchable={false} />}
      </TabPanel>
      <TabPanel value={type} index={2} data-testid="user-list">
        {results && <UserList users={results.users} />}
      </TabPanel>
    </Box>
    </>
  );
}