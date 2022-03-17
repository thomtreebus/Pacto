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
			<ListItemIcon>
				<Avatar
					src={pact.image}
					data-testid="avatar"
					sx={{ width: 32, height: 32 }}
				/>
			</ListItemIcon>
			<ListItemText primary={pact.name}/>
		</ListItem>
	);
}
