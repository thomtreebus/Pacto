/**
 * A list component to render the given users
 */

import React from "react";
import { Typography } from "@mui/material";
import UserCardModeration from "../cards/UserCardModeration";

/**
 * List of users to apply moderation to
 * @param {Array} users List of users to show
 * @param {Object} pact The pact that users are being shown for
 * @param {boolean} showBannedUsers Whether banned users should be visible or not
 */
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
				<UserCardModeration key={user._id} user={user} pact={pact} showBannedUsers={showBannedUsers} />
			))}
		</>
	);
}
