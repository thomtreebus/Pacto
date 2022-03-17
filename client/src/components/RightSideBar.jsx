import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { useAuth } from "../providers/AuthProvider";
import UserCard from "./UserCard";
import { Toolbar } from "@mui/material";
import UserList from "./UserList";

const drawerWidth = 240;

export default function RightSideBar() {
    const { user } = useAuth();


	return (
		<Box sx={{ display: { xs: "none", md: "flex" } }}>
			<Drawer
				data-testid="sidebar-drawer"
				variant="permanent"
				anchor={"right"}
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: drawerWidth,
						boxSizing: "border-box",
					},
				}}
			>
		<Toolbar data-testid="sidebar-toolbar2" />
		<UserList users={[user, user, user, user]}></UserList>


				{/* Insert content for right side bar here */}
			</Drawer>
		</Box>
	);
}
