import React from "react";
import { Grid, Card, CardHeader, Button, Avatar, Box } from "@mui/material";
import { CardContent, Typography, CardActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PactChip from "./PactChip";
import { useHistory } from "react-router-dom";

export default function PactCard({ pact, joined }) {
	const history = useHistory();

	return (
		<Grid item xs={12} s={6} md={4} lg={3}>
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
						<div
							style={{
								overflow: "hidden",
								textOverflow: "ellipsis",
								width: "100%",
							}}
						>
							<Typography
								variant="body2"
								sx={{
									marginBottom: "10px",
								}}
								noWrap
							>
								{pact.description}
							</Typography>
						</div>
					</Box>

					<Box
						sx={{
							alignItems: "center",
							gap: "5px",
							display: "flex",
						}}
					>
						<PeopleAltRoundedIcon />{" "}
						<span data-testid="member-length"> {pact.members.length} </span>
					</Box>
				</CardContent>
				<CardActions disableSpacing>
					{joined === true ? (
						<Button
							variant="contained"
							sx={{ width: "100%" }}
							startIcon={<VisibilityIcon />}
							onClick={() => history.push(`/pact/${pact._id}`)}
						>
							View
						</Button>
					) : (
						<Button
							variant="outlined"
							sx={{ width: "100%" }}
							startIcon={<AddIcon />}
							onClick={() => history.push(`/pact/${pact._id}`)}
						>
							Join
						</Button>
					)}
				</CardActions>
			</Card>
		</Grid>
	);
}
