import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import { useHistory } from "react-router-dom";

export default function PactListItem({ pact }) {
	const history = useHistory();

	return (
		<ListItem
			onClick={(event) => history.replace(`/pact/${pact._id}`)}
			sx={{ 
				cursor: "pointer",
				"&:hover": {
					backgroundColor: "#f5f5f5"
				} 
			}}
			data-testid="item"
	
		>
			<ListItemIcon
				// sx={{
				// 	"&:hover": {
				// 		color: "#007FFF"
				// 	}
				// }}
			>
				<Avatar src={pact.image} data-testid="avatar" />
			</ListItemIcon>
			<ListItemText primary={pact.name} 				
				// sx={{
				// 	"&:hover": {
				// 		color: "#007FFF"
				// 	}
				// }}
			/>
		</ListItem>
	);
}
