import {Fab, Grid} from "@mui/material";
import PostList from "../PostList";
import {Box} from "@mui/system";
import AboutPact from "../AboutPact";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CreatePostCard from "../CreatePostCard";
import {useEffect, useState} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import { useHistory } from "react-router-dom";
import {useAuth} from "../../providers/AuthProvider";
import Loading from "../../pages/Loading";

export default function PactPageFeedTab({pact}){
  const [open, setOpen] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if(pact === null){
      return;
    }
    const moderators = pact.moderators.flatMap((user) => user._id);

    if (moderators.includes(user._id)) {
      setIsMod(true);
    } else {
      setIsMod(false);
    }
    setIsLoading(false);
  }, [pact])

  if(isLoading){
    return(
      <Loading />
    )
  }

  return(
    <div>
      <Grid container width="100%" justifyContent="center">
        <Grid item xs={12} lg={8} xl={7}>
          {pact && <PostList posts={pact.posts}/>}
        </Grid>
        <Grid item lg={4} xl={3}>
          <Box
            sx={{paddingTop: "16px", paddingRight: "16px"}}
            display={{xs: "none", lg: "block"}}
            position={"sticky"}
            top={65}
          >
            {pact && <AboutPact pact={pact}/>}

            <Box position={"absolute"} bottom={-16} right={20}>
              {isMod && (
                <Fab
                  onClick={() => {
                    history.push(`/pact/${pact._id}/edit-pact`);
                  }}
                  size="medium"
                  padding="0 8px"
                  data-testid="edit-pact-button"
                >
                  <EditIcon color="primary"/>
                </Fab>
              )}
              <Fab
                color="primary"
                aria-label="add"
                size="medium"
                onClick={handleClickOpen}
              >
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
            <CreatePostCard pactID={pact._id}/>
          </DialogContent>
        </Dialog>
      </Box>
    </div>
  )
}