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
import LeaveIcon from "@mui/icons-material/ExitToApp";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorMessage from "../ErrorMessage";

/**
 * A feed displaying posts and information about a pact, plus other functionality
 * @param {Object} pact Pact document
 */
export default function PactPageFeedTab({pact}){
  const [open, setOpen] = useState(false);
  const [isMod, setIsMod] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const theme = useTheme();
  const { user, silentUserRefresh } = useAuth();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleButtonClicked = async (path) => {
    setIsButtonDisabled(true);

    const response = await fetch(
      `${process.env.REACT_APP_URL}/pact/${pact._id}/${path}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    try {
      const json = await response.json();
      if (json.errors.length) throw Error(json.errors[0].message);
    } catch (err) {
      setIsError(true);
      setErrorMessage(err.message);
      setIsButtonDisabled(false);
      return;
    }

    await silentUserRefresh();
    history.push(`/hub`);
  };

  useEffect(() => {
    if (pact) {
      const moderators = pact.moderators.flatMap((user) => user._id);

      if (moderators.includes(user._id)) {
        setIsMod(true);
      } else {
        setIsMod(false);
      }
      setIsLoading(false);
    }
  }, [pact, user])

  if(isLoading){
    return(
      <Loading />
    )
  }

  return(
      <>
        <ErrorMessage
          isOpen={isError}
          setIsOpen={setIsError}
          message={errorMessage}
        />
        <Grid container width="100%" justifyContent="center">
          <Grid item xs={12} lg={8} xl={7}>
            {pact && <PostList posts={pact.posts} />}
          </Grid>
          <Grid item lg={4} xl={3}>
            <Box
              sx={{ paddingTop: "16px", paddingRight: "16px" }}
              display={{ xs: "none", lg: "block" }}
              position={"sticky"}
              top={65}
            >
              {pact && <AboutPact pact={pact} />}

              <Box position={"absolute"} bottom={-16} right={20}>
                <Fab
                  color="primary"
                  aria-label="add"
                  size="medium"
                  onClick={handleClickOpen}
                >
                  <AddIcon />
                </Fab>

                {isMod && (
                  <Fab
                    onClick={() => {
                      history.push(`/pact/${pact._id}/edit-pact`);
                    }}
                    size="medium"
                    padding="0 8px"
                    data-testid="edit-pact-button"
                  >
                    <EditIcon color="primary" />
                  </Fab>
                )}

                {pact?.moderators.length === 1 && isMod ? (
                  <Fab
                    color="secondary"
                    aria-label="add"
                    size="medium"
                    onClick={() => handleButtonClicked("delete")}
                    disabled={isButtonDisabled}
                  >
                    <DeleteIcon />
                  </Fab>
                ) : (
                  <Fab
                    color="secondary"
                    aria-label="add"
                    size="medium"
                    onClick={() => handleButtonClicked("leave")}
                    disabled={isButtonDisabled}
                  >
                    <LeaveIcon />
                  </Fab>
                )}
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
              <CreatePostCard pactID={pact._id} />
            </DialogContent>
          </Dialog>
        </Box>
      </>
  )
}