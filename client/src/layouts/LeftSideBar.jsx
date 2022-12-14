/**
 * The left sidebar component to be shown on the website
 */

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "./AppBar";
import LeftSideBarContent from "../components/LeftSideBarContent";

const drawerWidth = 240;

/**
 * A left sidebar (and also an appbar for some reason)
 */
export default function LeftSideBar() {
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	return (
		<Box sx={{ display: "flex" }}>
			<AppBar handleDrawerToggle={handleDrawerToggle} />
			<Box
				component="nav"
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
				aria-label="mailbox folders"
			>
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{ keepMounted: true }}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}
					data-testid="temporary-sidebar"
				>
					<LeftSideBarContent />
				</Drawer>
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", sm: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}
					open
					data-testid="permanent-sidebar"
				>
					<LeftSideBarContent />
				</Drawer>
			</Box>
		</Box>
	);
}
