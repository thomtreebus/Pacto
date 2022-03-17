import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import { useHistory } from "react-router-dom";
import { Typography } from "@mui/material";

export default function PactList({ pacts }) {
	const history = useHistory();

	if (!pacts.length) {
		return (
			<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
				You are not in any pacts
			</Typography>
		);
	}

	return (
		<div>
			{pacts.map((pact) => (
				<ListItem
					key={pact._id}
					onClick={(event) => history.replace(`/pact/${pact._id}`)}
					sx={{ cursor: "pointer" }}
				>
					<ListItemIcon>
						<Avatar src={pact.image} />
					</ListItemIcon>
					<ListItemText primary={pact.name} />
				</ListItem>
			))}
		</div>
	);
}
