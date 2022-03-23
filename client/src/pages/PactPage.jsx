import {Fab, Grid} from "@mui/material";
import { Box } from "@mui/system";
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from "react";
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
      else{
        setIsMod(false)
      }
    }).catch((err) => {
      history.push("/not-found");
    })
  }, [pactID, history, user])

  return (
    <>
    { isLoading && <Loading /> }
      <Grid container width="100%" justifyContent="center">
        <Grid item xs={12} lg={8} xl={7}>
          { pact && <PostList posts={pact.posts}/> }
        </Grid>
        <Grid item lg={4} xl={3}>
          <Box sx={{ paddingTop: "16px", paddingRight: "16px" }} display={{ xs: "none", lg: "block" }} position={"sticky"} top={65}>
            { pact && <AboutPact pact={pact} /> }

            <Box position={"absolute"} bottom={-16} right={20} >
              {isMod && <Fab
                onClick={() => {
                  history.push(`/pact/${pactID}/edit-pact`)
                }}
                size="medium"
                padding="0 8px"
              >
                <EditIcon  color="primary" />
              </Fab>}
              <Fab color="primary" aria-label="add" size="medium">
                <AddIcon />
              </Fab>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
