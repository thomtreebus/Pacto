import { Fab, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutPact from "../components/AboutPact";
import PostList from "../components/PostList";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";
import CreatePostCard from "../components/CreatePostCard"
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import AddIcon from '@mui/icons-material/Add';

export default function PactPage() {
  const { pactID } = useParams();
  const [pact, setPact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
    }).catch(() => {
      history.push("/not-found");
    })
  }, [pactID, history])

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
            <Box position={"absolute"} bottom={-27} right={50}>
              <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
                <AddIcon/>
              </Fab>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Box position={"fixed"} bottom={50} right={300}>
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
          fullWidth
          maxWidth="sm"
          data-testid="dialog"
        >
          <DialogTitle id="responsive-dialog-title">
            {"Create Post"}
          </DialogTitle>
          <DialogContent>
            <CreatePostCard pactID={pactID}/>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
}
