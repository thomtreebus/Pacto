import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

const drawerWidth = 240;

export default function LeftSideBar() {
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
				{/* Insert content for right side bar here */}
			</Drawer>
		</Box>
	);
}
