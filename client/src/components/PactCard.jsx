import React from "react";
import { Grid, Card, CardHeader, Button, Avatar, Box } from "@mui/material";
import { CardContent, Typography, CardActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

export default function PactCard({ pact, joined }) {
	return (
		<Grid item xs={3}>
			<Card sx={{ maxWidth: 345 }}>
				<CardHeader avatar={<Avatar>P</Avatar>} title={pact.name} />
				<CardContent>
					<Typography variant="body2" sx={{ marginBottom: "10px" }}>
						{pact.description}
					</Typography>
					<Box
						sx={{
							alignItems: "center",
							gap: "5px",
							display: "flex",
						}}
					>
						<PeopleAltRoundedIcon /> {pact.members.length}
					</Box>
				</CardContent>
				<CardActions disableSpacing>
					{joined === true ? (
						<Button
							variant="contained"
							sx={{ width: "100%" }}
							startIcon={<AddIcon />}
						>
							Join
						</Button>
					) : (
						<Button
							variant="outlined"
							sx={{ width: "100%" }}
							startIcon={<VisibilityIcon />}
						>
							View
						</Button>
					)}
				</CardActions>
			</Card>
		</Grid>
	);
}
