import { Fab, Grid } from "@mui/material";
import { Box } from "@mui/system";
import EditIcon from "@mui/icons-material/Edit";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutPact from "../components/AboutPact";
import PostList from "../components/PostList";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";
import CreatePostCard from "../components/CreatePostCard";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import LeaveIcon from "@mui/icons-material/ExitToApp";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../providers/AuthProvider";
import ErrorMessage from "../components/ErrorMessage";

export default function PactPage() {
	const { pactID } = useParams();
	const [pact, setPact] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isMod, setIsMod] = useState(false);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(false);
	const history = useHistory();
	const { user, setUser } = useAuth();
	const [open, setOpen] = useState(false);

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

	const handleClickOpen = () => {
		setOpen(true);
	};

  const handleClose = () => {
    setOpen(false);
  };

	const removePactLocally = () => {
		let newUser = Object.assign({}, user);
		newUser.pacts = newUser.pacts.filter((pact) => pact !== pactID);
		setUser(newUser);
	};

	const handleButtonClicked = async (path) => {
		setIsButtonDisabled(true);

		const response = await fetch(
			`${process.env.REACT_APP_URL}/pact/${pactID}/${path}`,
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

		removePactLocally();
		history.push(`/hub`);
	};

	useEffect(() => {
		const controller = new AbortController();

		fetch(`${process.env.REACT_APP_URL}/pact/${pactID}`, {
			method: "GET",
			credentials: "include",
			signal: controller.signal,
		})
			.then((res) => {
				if (!res.ok) {
					throw Error("Could not fetch pact");
				}
				return res.json();
			})
			.then((data) => {
				setPact(data.message);
				setIsLoading(false);
				const moderators = data.message.moderators.flatMap((user) => user._id);
				if (moderators.includes(user._id)) {
					setIsMod(true);
				} else {
					setIsMod(false);
				}
			})
			.catch((err) => {
				if (err.message === "Could not fetch pact") {
					history.push("/not-found");
				}
			});

		return () => controller.abort();
	}, [pactID, history, user]);

	if (isLoading) {
		return (
			<>
				<Loading />
			</>
		);
	}

	return (
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
										history.push(`/pact/${pactID}/edit-pact`);
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
						<CreatePostCard pactID={pactID} />
					</DialogContent>
				</Dialog>
			</Box>
		</>
	);
}
