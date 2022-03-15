import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import { useHistory } from "react-router-dom";

export default function PactList({ pacts }) {
	const history = useHistory();

	return (
		<div>
			{pacts.map((pact) => (
				<ListItem
					key={pact._id}
					onClick={(event) => history.replace(`/pact/${pact._id}`)}
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
