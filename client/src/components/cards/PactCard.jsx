/**
 * The PactCard which is shown on the university hub page.
 */

import React, { useState } from "react";
import { Grid, Card, CardHeader, Button, Avatar, Box } from "@mui/material";
import { CardContent, Typography, CardActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PactChip from "../pact/pactFeed/PactChip";
import { useHistory } from "react-router-dom";
import ErrorMessage from "../errors/ErrorMessage";
import { useAuth } from "../../providers/AuthProvider";

/**
 * A card displaying a pact which a user can use to visit or join it
 * @param {Object} pact The pact being displayed
 * @param {boolean} joined Whether the user has joined the pact
 */
export default function PactCard({ pact, joined }) {
	const { silentUserRefresh } = useAuth();
	const history = useHistory();
	const DESCRIPTION_LENGTH = 42;
	const [isJoinButtonDisabled, setIsJoinButtonDisabled] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

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

		if (json.errors.length) {
			setIsError(true);
			setErrorMessage(json.errors[0].message);
			setIsJoinButtonDisabled(false);
			return;
		}

		await silentUserRefresh()
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
							gap: "10px"
						}}
					>
						<PactChip pact={pact} />

						<Box sx={{
							overflow: "hidden",
							flex: 1,
							flexWrap: 'wrap',
							wordBreak: "break-word"
						}}>
							<Typography
								variant="body2"
								sx={{
									marginBottom: "10px",
								}}
							>
								{pact.description.slice(0, DESCRIPTION_LENGTH + 1)}{" "}
								{pact.description.length > DESCRIPTION_LENGTH && `...`}
							</Typography>
						</Box>
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
