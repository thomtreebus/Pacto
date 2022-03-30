import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useHistory } from "react-router-dom";
import FeedIcon from "@mui/icons-material/Feed";
import UniversityIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import { useAuth } from "../providers/AuthProvider";

const pages = [
	{ icon: <FeedIcon />, text: "Feed", path: "/feed" },
	{ icon: <UniversityIcon />, text: "University Hub", path: "/hub" },
	{ icon: <PeopleIcon />, text: "Users", path: "/users" },
];

/**
 * List of pages shown on sidebar
 */
export default function PageList() {
	const { activePage, setActivePage } = useAuth();
	const history = useHistory();

	const handleListItemClick = (path) => {
		setActivePage(path);
		history.push(path);
	};

	return pages.map((page) => (
		<ListItem
			button
			key={page.text}
			selected={activePage === page.path}
			onClick={(event) => handleListItemClick(page.path)}
		>
			<ListItemIcon>{page.icon}</ListItemIcon>
			<ListItemText primary={page.text} />
		</ListItem>
	));
}
