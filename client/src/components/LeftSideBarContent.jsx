import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import { Typography } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import PageList from "./PageList";
import MyPactList from "./MyPactList";

/**
 * The content of a sidebar
 */
export default function LeftSideBarContent() {
	const { user } = useAuth();

	return (
		<div>
			<Toolbar data-testid="sidebar-toolbar" />
			<Box sx={{ overflow: "auto" }}>
				<List data-testid="sidebar-profile-list">
					<ListItem>
						<ListItemIcon>
							<Avatar
								data-testid="sidebar-avatar"
								alt="Placeholder"
								src={user.image}
							/>
						</ListItemIcon>
						<ListItemText
							data-testid="sidebar-user-name"
							primary={`${user.firstName} ${user.lastName}`}
						/>
					</ListItem>
					<Divider />
					<PageList />
				</List>
				<Divider sx={{ marginBlock: 1, marginBlockEnd: 2 }} />
				<Typography
					data-testid="sidebar-mypacts-text"
					variant="p"
					sx={{ marginLeft: 10 }}
				>
					My Pacts
				</Typography>
				<MyPactList />
			</Box>
		</div>
	);
}
