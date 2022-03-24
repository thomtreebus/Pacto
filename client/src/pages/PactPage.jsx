import {Fab, Grid, Typography} from "@mui/material";
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

import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../providers/AuthProvider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PropTypes from "prop-types";
import UserList from "../components/UserList";


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
					<Typography component={'div'}>{children}</Typography>
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


export default function PactPage() {
	const { pactID } = useParams();
	const [pact, setPact] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isMod, setIsMod] = useState(false);
	const history = useHistory();
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
	const [membersTabValue, setMembersTabValue] = useState(0);
	const [mainPactTabValue, setMainPactTabValue] = useState(0);

	const [allModerators, setAllModerators] = useState(null);
	const [allBannedUsers, setAllBannedUsers] = useState(null);
	const [allPactMembers, setAllPactMembers] = useState(null);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleMainPactTabChange = (event, newValue) => {
		setMainPactTabValue(newValue);
	};

	const handleMembersTabChange = (event, newValue) => {
		setMembersTabValue(newValue);
	};
	

	useEffect(() => {
		fetch(`${process.env.REACT_APP_URL}/pact/${pactID}`, {
			method: "GET",
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) {
					throw Error("Could not fetch pact");
				}
				return res.json();
			})
			.then((data) => {
				setPact(data.message);
				setAllPactMembers(data.message.members)
				setAllModerators(data.message.moderators)
				setAllBannedUsers(data.message.bannedUsers)
				setIsLoading(false);
				const moderators = data.message.moderators.flatMap((user) => user._id);
				if (moderators.includes(user._id)) {
					setIsMod(true);
				} else {
					setIsMod(false);
				}
			})
			.catch((err) => {
				history.push("/not-found");
			});
	}, [pactID, history, user]);

	return (
		<>
			{isLoading && <Loading />}
			<Tabs value={mainPactTabValue} onChange={handleMainPactTabChange} aria-label="User type tab">
				<Tab label="Pact Posts" {...a11yProps(0)} />
				<Tab label="Pact Members" {...a11yProps(1)} />
			</Tabs>
			<TabPanel value={mainPactTabValue} index={0} >
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
								<Fab
									color="primary"
									aria-label="add"
									size="medium"
									onClick={handleClickOpen}
								>
									<AddIcon />
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
							<CreatePostCard pactID={pactID} />
						</DialogContent>
					</Dialog>
				</Box>
			</TabPanel>
			<TabPanel value={mainPactTabValue} index={1}>
				<Tabs value={membersTabValue} onChange={handleMembersTabChange} aria-label="User type tab">
					<Tab label="All Members" {...a11yProps(0)} />
					<Tab label="Moderators" {...a11yProps(1)} />
					<Tab label="Banned Users" {...a11yProps(1)} />
				</Tabs>
				<TabPanel value={membersTabValue} index={0}>
					<UserList users={allPactMembers}/>
				</TabPanel>
				<TabPanel value={membersTabValue} index={1}>
					<UserList users={allModerators}/>
				</TabPanel>
				<TabPanel value={membersTabValue} index={2}>
					<UserList users={allBannedUsers}/>
				</TabPanel>
			</TabPanel>
		</>
	);
}
