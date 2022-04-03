/**
 * The left sidebar component to be shown on the website
 */

import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import PopularPactsList from "../components/lists/PopularPactsList";
import { Typography, Toolbar, Divider } from "@mui/material";

const drawerWidth = 240;

/**
 * A right sidebar
 */
export default function RightSideBar() {
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
				<Divider sx={{ marginBlockEnd: 2 }} />
				<Typography
					data-testid="sidebar-popularpacts-text"
					variant="p"
					sx={{ marginLeft: 10 }}
				>
					Popular Pacts
				</Typography>
				<PopularPactsList numberOfPacts={10} />
			</Drawer>
		</Box>
	);
}
