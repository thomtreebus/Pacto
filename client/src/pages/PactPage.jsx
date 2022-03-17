import {Fab, Grid, IconButton} from "@mui/material";
import { Box } from "@mui/system";
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutPact from "../components/AboutPact";
import PostList from "../components/PostList";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";

import AddIcon from '@mui/icons-material/Add';
import {useAuth} from "../providers/AuthProvider";

export default function PactPage() {
  const { pactID } = useParams();
  const [pact, setPact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMod, setIsMod] = useState(false);
  const history = useHistory();
  const {user} = useAuth()

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/pact/${pactID}`, {
      method: "GET",
      credentials: "include"
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch pact");
      }
      return res.json();
    }).then((data) => {
      setPact(data.message);
      setIsLoading(false);
      const moderators = data.message.moderators.flatMap((user) => user._id)
      if(moderators.includes(user._id)){
        setIsMod(true)
      }
    }).catch((err) => {
      history.push("/not-found");
    })
  }, [pactID, history, user])

  return (
    <>
    { isLoading && <Loading /> }
      <Grid container width={"50vw"}>
        <Grid item xs={12} lg={8}>
          { pact && <PostList posts={pact.posts}/> }
        </Grid>
        <Grid item lg={4}>
          <Box sx={{ paddingTop: "16px", paddingRight: "16px" }} display={{ xs: "none", lg: "block" }} position={"sticky"} top={65}>
            { pact && <AboutPact pact={pact} /> }
            {isMod && <IconButton
              onClick={() => {
                history.push(`/pact/${pactID}/edit-pact`)
              }}
            >
              <EditIcon  color="primary" />
            </IconButton>}
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
