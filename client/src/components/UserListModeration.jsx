import React from "react";
import { Typography } from "@mui/material";
import UserCardModeration from "./UserCardModeration";

export default function UserListModeration({ users, pact, showBannedUsers }) {
	if (!users.length) {
		return (
			<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
				There are no users in this category.
			</Typography>
		);
	}

	return (
		<>
			{users.map((user) => (
				<UserCardModeration user={user} pact={pact} showBannedUsers={showBannedUsers} />
			))}
		</>
	);
}
