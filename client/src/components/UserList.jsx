/**
 * A list component to render the given users
 */

import React from "react";
import { Typography } from "@mui/material";
import UserCard from "./UserCard";

/**
 * Produces a list of users
 * @param {Array} users Array of users
 */
export default function UserList({ users }) {
	if (!users || !users.length) {
		return (
			<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
				There are no users in this category
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
