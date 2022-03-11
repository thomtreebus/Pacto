import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import ErrorPage from "./Error";
import Loading from "./Loading";
import PostList from "../components/PostList";
import PactGrid from "../components/PactGrid";
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


export default function SearchResults() {
  const { query } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [type, setType] = useState(0);
  const [data, setData] = useState([]);
  
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
  }, [])

  useEffect(() => {
    if (results) {
      let data = []
      if (type === 0) data = results.pacts;
      if (type === 1) data = results.posts;
      if (type == 2) data = results.users;
      setData()
    }
  }, [results, type])

  const handleTabChange = (event, newType) => {
    setType(newType);
  };

  return (
    <>
    { isLoading && <Loading /> }
    {error && <ErrorPage />}
      <Typography>Showing results for: {query}</Typography>
      <Box sx={{ width: '100%'}}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs value={type} onChange={handleTabChange} centered>
            <Tab label="Pacts" />
            <Tab label="Posts" />
            <Tab label="Users" />
          </Tabs>
        </Box>
        <TabPanel value={type} index={0}>
          {results && <PactGrid pacts={results.pacts} />}
        </TabPanel>
        <TabPanel value={type} index={1}>
          {results && <PostList posts={results.posts}/>}
        </TabPanel>
        <TabPanel value={type} index={2}>
          Item Three
        </TabPanel>
      </Box>
      
    </>
  );
}