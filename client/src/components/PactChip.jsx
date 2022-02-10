import React from "react";
import PeopleIcon from "@mui/icons-material/People";
import CommentIcon from "@mui/icons-material/Comment";
import BookIcon from "@mui/icons-material/MenuBook";
import CreateIcon from "@mui/icons-material/Create";
import { Chip } from "@mui/material";

export default function PactChip({ pact }) {
	let icon = <CommentIcon />;
	let color = "info";

	if (pact.category === "course") {
		icon = <BookIcon />;
		color = "warning";
	} else if (pact.category === "module") {
		icon = <CreateIcon />;
		color = "secondary";
	} else if (pact.category === "society") {
		icon = <PeopleIcon />;
		color = "error";
	}

	return (
		<Chip
			color={color}
			size="small"
			icon={icon}
			label={pact.category}
			sx={{ padding: "5px" }}
		/>
	);
}
