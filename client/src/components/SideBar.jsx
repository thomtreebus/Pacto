import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import PactoIcon from "../assets/thom.jpeg";
import FeedIcon from "@mui/icons-material/Feed";
import PactIcon from "@mui/icons-material/Forum";
import FriendsIcon from "@mui/icons-material/People";
import UniversityIcon from "@mui/icons-material/School";
import { deepPurple } from "@mui/material/colors";
import { Typography } from "@mui/material";
import { useHistory } from "react-router-dom";

const drawerWidth = 240;

export default function SideBar() {
	const history = useHistory();
	const [selectedIndex, setSelectedIndex] = React.useState(0);

	const handleListItemClick = (event, index, path) => {
		setSelectedIndex(index);
		history.push(path);
	};

	return (
		<Box sx={{ display: "flex" }}>
			<Drawer
				data-testid="sidebar-drawer"
				variant="permanent"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: drawerWidth,
						boxSizing: "border-box",
					},
				}}
			>
				<Toolbar data-testid="sidebar-toolbar"/>
				<Box sx={{ overflow: "auto" }}>
					<List data-testid="sidebar-profile-list">
						<ListItem>
							<ListItemIcon>
								<Avatar data-testid="sidebar-avatar" alt="Placeholder" src={PactoIcon} />
							</ListItemIcon>
							<ListItemText data-testid="sidebar-user-name" primary="Thom Treebus" />
						</ListItem>
						<Divider />
						<ListItem
							button
							data-testid="sidebar-feed"
							key="Feed"
							selected={selectedIndex === 0}
							onClick={(event) => handleListItemClick(event, 0, "/feed")}
						>
							<ListItemIcon>
								<FeedIcon data-testid="sidebar-feed-icon"/>
							</ListItemIcon>
							<ListItemText primary="Feed" />
						</ListItem>
						<ListItem
							button
							data-testid="sidebar-hub"
							key="University Hub"
							selected={selectedIndex === 1}
							onClick={(event) => handleListItemClick(event, 1, "/hub")}
						>
							<ListItemIcon>
								<UniversityIcon data-testid="sidebar-hub-icon" />
							</ListItemIcon>
							<ListItemText primary="University Hub" />
						</ListItem>
						<ListItem
							button
							key="Pacts"
							data-testid="sidebar-pacts"
							selected={selectedIndex === 2}
							onClick={(event) => handleListItemClick(event, 2, "/pacts")}
						>
							<ListItemIcon>
								<PactIcon data-testid="sidebar-pacts-icon"/>
							</ListItemIcon>
							<ListItemText primary="Pacts" />
						</ListItem>
						<ListItem
							button
							data-testid="sidebar-friends"
							key="Friends"
							selected={selectedIndex === 3}
							onClick={(event) => handleListItemClick(event, 3, "/friends")}
						>
							<ListItemIcon>
								<FriendsIcon data-testid="sidebar-friends-icon"/>
							</ListItemIcon>
							<ListItemText primary="Friends" />
						</ListItem>
					</List>
					<Divider />
					<Typography data-testid="sidebar-mypacts-text" variant="p" sx={{ marginLeft: 10, marginTop: 1 }}>
						My Pacts
					</Typography>
					<List>
						{["Pact1", "Pact2", "Pact3"].map((text, index) => (
							<ListItem button key={text}>
								<ListItemIcon>
									<Avatar sx={{ bgcolor: deepPurple[500] }}>
										{text.substring(0, 2).toUpperCase()}
									</Avatar>
								</ListItemIcon>
								<ListItemText primary={text} />
							</ListItem>
						))}
					</List>
				</Box>
			</Drawer>
		</Box>
	);
}
