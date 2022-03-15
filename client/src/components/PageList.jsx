import React, { useState } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useHistory } from "react-router-dom";
import FeedIcon from "@mui/icons-material/Feed";
import UniversityIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";

const pages = [
	{ icon: <FeedIcon />, text: "Feed", path: "/feed" },
	{ icon: <UniversityIcon />, text: "University Hub", path: "/hub" },
	{ icon: <PeopleIcon />, text: "Users", path: "/users" },
];

export default function PageList() {
	const history = useHistory();
	const [activePage, setActivePage] = useState(pages[0].path);

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
