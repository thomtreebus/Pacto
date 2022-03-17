import React from "react";
import { Typography } from "@mui/material";
import UserCard from "./UserCard";

export default function UserList({ users }) {
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
				<UserCard user={user} key={user._id} />
			))}
		</>
	);
}
