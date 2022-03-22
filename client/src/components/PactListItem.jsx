import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import { useHistory } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function PactListItem({ pact }) {
	const { user } = useAuth(); 
	const history = useHistory();


	function handleClick() {	
		if (pact.members.includes(user._id)) {
			history.replace(`/pact/${pact._id}`);
		} else {
			console.log("You are not in this pact cannot navigate to that page!");
		}
	}

	return (
		<ListItem
			onClick={handleClick}
			sx={{ cursor: "pointer" }}
			data-testid="item"
		>
			<ListItemIcon>
				<Avatar src={pact.image} data-testid="avatar" />
			</ListItemIcon>
			<ListItemText primary={pact.name} />
		</ListItem>
	);
}
