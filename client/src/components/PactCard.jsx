import React from "react";
import { Grid, Card, CardHeader, Button, Avatar, Box } from "@mui/material";
import { CardContent, Typography, CardActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PactChip from "./PactChip";
import { useHistory } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";

export default function PactCard({ pact, joined }) {
	const history = useHistory();
	const DESCRIPTION_LENGTH = 42;
	const [isJoinButtonDisabled, setIsJoinButtonDisabled] = React.useState(false);
	const [isError, setIsError] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState(null);

	function handleViewButtonClick() {
		history.push(`/pact/${pact._id}`);
	}

	async function handleJoinButtonClick() {
		setIsJoinButtonDisabled(true);

		const response = await fetch(
			`${process.env.REACT_APP_URL}/pact/${pact._id}/join`,
			{
				method: "POST",
				credentials: "include",
			}
		);

		const json = await response.json();

		console.log(json);

		if (json.errors.length) {
			setIsError(true);
			setErrorMessage(json.errors[0].message);
			setIsJoinButtonDisabled(false);
			return;
		}

		history.push(`/pact/${pact._id}`);
	}

	return (
		<Grid item xs={12} s={6} md={4} lg={3}>
			<ErrorMessage
				isOpen={isError}
				setIsOpen={setIsError}
				message={errorMessage}
			/>
			<Card>
				<CardHeader
					avatar={<Avatar src={pact.image} alt="pact-image" />}
					title={pact.name}
					sx={{ paddingBlock: 1 }}
				/>
				<CardContent>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-start",
							gap: "10px",
						}}
					>
						<PactChip pact={pact} />

						<Typography
							variant="body2"
							sx={{
								marginBottom: "10px",
							}}
						>
							{pact.description.substr(0, DESCRIPTION_LENGTH + 1)}{" "}
							{pact.description.length > DESCRIPTION_LENGTH && `...`}
						</Typography>
					</Box>

					<Box
						sx={{
							alignItems: "center",
							gap: "5px",
							display: "flex",
						}}
					>
						<PeopleAltRoundedIcon />
						<span data-testid="member-length"> {pact.members.length} </span>
					</Box>
				</CardContent>
				<CardActions disableSpacing>
					{joined === true ? (
						<Button
							variant="contained"
							sx={{ width: "100%" }}
							startIcon={<VisibilityIcon />}
							onClick={handleViewButtonClick}
						>
							View
						</Button>
					) : (
						<Button
							variant="outlined"
							sx={{ width: "100%" }}
							startIcon={<AddIcon />}
							onClick={handleJoinButtonClick}
							disabled={isJoinButtonDisabled}
						>
							Join
						</Button>
					)}
				</CardActions>
			</Card>
		</Grid>
	);
}
